/* ============================================================
   다섯 개의 문 — 채용서류 텍스트 파서
   ------------------------------------------------------------
   NCS 표준 양식의 직무설명자료(직무기술서)와 채용공고문에서
   게임에 필요한 정보를 추출합니다. (브라우저·Node 공용, 순수 함수)
   추출은 어디까지나 "초안"이며, 게임 인트로의 확인 화면에서
   지원자가 직접 수정·보완할 수 있습니다.
   ============================================================ */
(function (global) {
  "use strict";

  /* 공백이 끼어든 한글 키워드도 찾는 유연 패턴 생성 ("직 무 수 행 내 용") */
  function flex(word) {
    return word.split("").join("\\s*");
  }

  function clean(s) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  }

  /* 텍스트에서 마커들 사이의 구간을 잘라냄 */
  function sliceBetween(text, startWords, endWords) {
    var startIdx = -1, startLen = 0;
    for (var i = 0; i < startWords.length; i++) {
      var m = text.match(new RegExp(flex(startWords[i])));
      if (m && (startIdx === -1 || m.index < startIdx)) {
        startIdx = m.index;
        startLen = m[0].length;
      }
    }
    if (startIdx === -1) return "";
    var rest = text.slice(startIdx + startLen);
    var endIdx = rest.length;
    for (var j = 0; j < endWords.length; j++) {
      var e = rest.match(new RegExp(flex(endWords[j])));
      if (e && e.index < endIdx) endIdx = e.index;
    }
    return rest.slice(0, endIdx);
  }

  /* "○ 항목" 목록 분해 */
  function splitBullets(section) {
    return section.split(/[○◦]/).map(clean).filter(function (s) {
      return s.length >= 4 && s.length <= 200;
    });
  }

  /* 쉼표 나열형 키워드 분해 */
  function splitKeywords(section, maxLen) {
    return section.split(/[,，]/).map(function (s) {
      return clean(s).replace(/^[·․○◦-]+\s*/, "").replace(/\s*등$/, "");
    }).filter(function (s) {
      return s.length >= 2 && s.length <= (maxLen || 40);
    });
  }

  function dedupe(arr, cap) {
    var seen = {}, out = [];
    arr.forEach(function (s) {
      var k = s.replace(/\s/g, "");
      if (!seen[k] && out.length < (cap || 30)) { seen[k] = 1; out.push(s); }
    });
    return out;
  }

  /* ---------------------------------------------------------
     직무설명자료(직무기술서) 파싱 → 직군별 정보
     --------------------------------------------------------- */
  var SECTION_ORDER = ["직무수행내용", "필요지식", "필요기술", "직무수행태도", "직업기초능력", "필요자격", "관련자격", "참고", "채용분야"];

  function parseJobDoc(text) {
    text = String(text || "");
    // 직군 블록 분해: "□ 사무 근무처", "□ ICT ..." 패턴
    var blockRe = new RegExp("□\\s*([가-힣A-Za-z·]{2,12}?)\\s*" + flex("근무처"), "g");
    var marks = [], m;
    while ((m = blockRe.exec(text)) !== null) {
      marks.push({ name: clean(m[1]), idx: m.index });
    }
    var blocks = [];
    if (marks.length === 0) {
      blocks.push({ name: "지원 직무", body: text });
    } else {
      marks.forEach(function (mk, i) {
        blocks.push({
          name: mk.name,
          body: text.slice(mk.idx, i + 1 < marks.length ? marks[i + 1].idx : text.length)
        });
      });
    }

    return blocks.map(function (b) {
      function section(name) {
        var others = SECTION_ORDER.filter(function (s) { return s !== name; });
        return sliceBetween(b.body, [name], others);
      }
      var tasks = splitBullets(section("직무수행내용")).map(function (t) {
        // 긴 항목은 앞부분만 (선택 칩으로 쓰기 좋게)
        return t.length > 60 ? t.slice(0, 57) + "…" : t;
      });
      var knowledge = dedupe(splitKeywords(section("필요지식"), 60), 15);
      var skills = dedupe(splitKeywords(section("필요기술"), 40), 15);
      var attitudes = dedupe(splitKeywords(section("직무수행태도"), 40), 12);
      var basics = dedupe(splitKeywords(section("직업기초능력"), 12).filter(function (s) {
        return /능력$/.test(s);
      }), 10);
      var reqQuals = splitBullets(section("필요자격"));
      var relQuals = dedupe(splitKeywords(section("관련자격"), 30), 12);
      return {
        name: b.name,
        tasks: dedupe(tasks, 12),
        knowledge: knowledge,
        skills: skills,
        attitudes: attitudes,
        basics: basics,
        reqQuals: dedupe(reqQuals, 6),
        relQuals: relQuals
      };
    }).filter(function (j) {
      // 실질 내용이 있는 블록만
      return j.tasks.length || j.skills.length || j.knowledge.length;
    });
  }

  /* ---------------------------------------------------------
     채용공고문 파싱 → 기관·인재상·핵심가치·가점·자소서 문항
     --------------------------------------------------------- */
  var CERT_HINT = /(기사|기능장|기능사|검정|인증|활용능력|급|토익|TOEIC|토스|스피킹|OPIc|오픽|ADsP|ADP|DAP|DAsP|SQLP|SQLD|COS|PCCP|JLPT|HSK|텝스|TEPS)/i;

  function parseNotice(text) {
    text = String(text || "");
    var out = { orgName: "", coreValues: [], talents: [], bonusCerts: [], essays: [], langReq: "" };

    // 기관명: 공공기관 접미사가 붙은 첫 단어
    var org = text.match(/([가-힣]{2,18}(?:공사|공단|진흥원|연구원|정보원|평가원|공제회|재단|공공기관|센터))/);
    if (org) out.orgName = org[1];

    // 핵심가치: "핵심가치(A, B, C…)" 패턴
    var cv = text.match(new RegExp(flex("핵심가치") + "\\s*[\\(（]([^\\)）]{4,120})[\\)）]"));
    if (cv) out.coreValues = dedupe(splitKeywords(cv[1], 12), 8);

    // 인재상: "X(영문, 한글)" 나열 패턴 — "인재상" 표기 근처(±800자)에서만 인정
    // 예: P(Passionate, 열정), O(Open-minded, 소통) → 열정, 소통
    var talentSpots = [];
    var ts, spotRe = new RegExp(flex("인재상"), "g");
    while ((ts = spotRe.exec(text)) !== null) talentSpots.push(ts.index);
    var tt, talentRe = /[A-Za-z][A-Za-z\- ]{2,20},\s*([가-힣]{2,4})\s*[\)）]/g;
    var talents = [];
    while ((tt = talentRe.exec(text)) !== null) {
      var near = talentSpots.some(function (idx) { return Math.abs(tt.index - idx) < 800; });
      if (near) talents.push(tt[1]);
    }
    out.talents = dedupe(talents, 8);

    // 가점 자격증: 마지막 "가점표/자격가점" 표기 뒤 구간에서 자격증형 토큰 추출
    // "가점표"(가장 구체적) 우선, 없으면 "자격가점" → "가점" 순서로 마지막 표기 위치 채택
    var bonusStart = -1;
    var priority = ["가점표", "자격가점", "가점"];
    for (var p = 0; p < priority.length && bonusStart === -1; p++) {
      var re2 = new RegExp(flex(priority[p]), "g"), mm;
      while ((mm = re2.exec(text)) !== null) {
        if (mm.index > bonusStart) bonusStart = mm.index;
      }
    }
    var bonusZone = bonusStart === -1 ? "" : text.slice(bonusStart, bonusStart + 3500);
    // 다음 "블라인드/결격/반환" 안내가 나오면 거기까지만
    var stop = bonusZone.search(new RegExp(flex("블라인드") + "|" + flex("결격사유") + "|" + flex("서류반환")));
    if (stop > 100) bonusZone = bonusZone.slice(0, stop);
    var tokens = bonusZone.split(/[,，·∙\n\/\[\]’‘'"]+|\d+\s*점|이상/).map(clean).filter(function (s) {
      return s.length >= 2 && s.length <= 28 && CERT_HINT.test(s) &&
        !/가점|배점|대상|종류|인정|기준|접수|발표|응시|환산|상한|점수|유효|보유|언급|불가|블라인드/.test(s);
    });
    out.bonusCerts = dedupe(tokens, 25);

    // 자기소개서 문항: [제목] ... 기술하여 주십시오
    var es, essayRe = /\[([^\]\n]{2,25})\]\s*([^\[]{15,400}?(?:기술|작성)하여\s*주십시오)/g;
    while ((es = essayRe.exec(text)) !== null) {
      out.essays.push({ title: clean(es[1]), text: clean(es[2]) });
    }
    out.essays = out.essays.slice(0, 6);

    // 어학 기준
    var lang = text.match(/(?:TOEIC|토익)\s*기준\s*[:：]?\s*(\d{3})/);
    if (lang) out.langReq = "토익 " + lang[1] + "점 이상 (환산 기준)";

    return out;
  }

  var Parser = { parseJobDoc: parseJobDoc, parseNotice: parseNotice };
  if (typeof module !== "undefined" && module.exports) module.exports = Parser;
  global.DocParser = Parser;
})(typeof window !== "undefined" ? window : globalThis);
