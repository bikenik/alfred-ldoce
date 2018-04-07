const header = require('./input/header.json')

let verbTable = ''
header.forEach(elem => {
	if (elem.Inflections) {
		if (elem.Inflections.past_tense) {
			verbTable += `
<div id="DIV_2">
  <span id="SPAN_3">Verb table</span>
  <span id="SPAN_4">${elem.Headword}</span>
</div>
<div class="DIV_1">
  <br>
  <table id="TABLE_5">
    <tbody id="TBODY_6">
      <tr id="TR_7">
        <td colspan="3" id="TD_8">
          Simple Form
        </td>
      </tr>
      <tr id="TR_9">
        <td id="TD_10">
          Present
        </td>
      </tr>
      <tr id="TR_11">
        <td id="TD_12">
          I, you, we, they
        </td>
        <td id="TD_13">
          <span id="SPAN_14">${elem.Headword}</span>
          <span id="SPAN_15"></span>
        </td>
      </tr>
      <tr id="TR_16">
        <td id="TD_17">
          he, she, it
        </td>
        <td id="TD_18">
          <span id="SPAN_19">${elem.Inflections.third_person_singular}
          </span>
          <span id="SPAN_20"></span>
        </td>
      </tr>
      <tr id="TR_21">
        <td class="view_more" colspan="3" id="TD_22">
          <span id="SPAN_23">&gt; View More</span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_24">
        <td id="TD_25">
          Past
        </td>
      </tr>
      <tr class="next_tenses" id="TR_26">
        <td id="TD_27">
          I, you, he, she, it, we, they
        </td>
        <td id="TD_28">
          <span id="SPAN_29">${elem.Inflections.past_tense}</span>
          <span id="SPAN_30"></span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_31">
        <td id="TD_32">
          Present perfect
        </td>
      </tr>
      <tr class="next_tenses" id="TR_33">
        <td id="TD_34">
          I, you, we, they
        </td>
        <td id="TD_35">
          <span id="SPAN_36">have</span>
          <span id="SPAN_37">${elem.Inflections.past_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_38">
      </tr>
      <tr class="next_tenses" id="TR_39">
        <td id="TD_40">
          he, she, it
        </td>
        <td id="TD_41">
          <span id="SPAN_42">has</span>
          <span id="SPAN_43">${elem.Inflections.past_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_44">
        <td id="TD_45">
          Past perfect
        </td>
      </tr>
      <tr class="next_tenses" id="TR_46">
        <td id="TD_47">
          I, you, he, she, it, we, they
        </td>
        <td id="TD_48">
          <span id="SPAN_49">had</span>
          <span id="SPAN_50">${elem.Inflections.past_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_51">
        <td id="TD_52">
          Future
        </td>
      </tr>
      <tr class="next_tenses" id="TR_53">
        <td id="TD_54">
          I, you, he, she, it, we, they
        </td>
        <td id="TD_55">
          <span id="SPAN_56">will</span>
          <span id="SPAN_57">${elem.Headword}</span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_58">
        <td id="TD_59">
          Future perfect
        </td>
      </tr>
      <tr id="TR_60" class="next_tenses">
        <td id="TD_61">
          I, you, he, she, it, we, they
        </td>
        <td id="TD_62">
          <span id="SPAN_63">will have</span>
          <span id="SPAN_64">${elem.Inflections.past_participle}
          </span>
        </td>
      </tr>
      <tr id="TR_65" class="next_tenses">
        <td colspan="3" id="TD_66" class="view_less">
          <span id="SPAN_67">&gt; View Less</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>`
		}
		if (elem.Inflections.present_participle) {
			verbTable += `
<div class="DIV_2">
  <table id="TABLE_68">
    <tbody id="TBODY_69">
      <tr id="TR_70">
        <td colspan="3" id="TD_71">
          Continuous Form
        </td>
      </tr>
      <tr id="TR_72">
        <td id="TD_73">
          Present
        </td>
      </tr>
      <tr id="TR_74">
        <td id="TD_75">
          I
        </td>
        <td id="TD_76">
          <span id="SPAN_77">am</span>
          <span id="SPAN_78">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr id="TR_79">
        <td id="TD_80">
          he, she, it
        </td>
        <td id="TD_81">
          <span id="SPAN_82">is</span>
          <span id="SPAN_83">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr id="TR_84">
        <td class="view_more" colspan="3" id="TD_85">
          <span id="SPAN_86">&gt; View More</span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_87">
      </tr>
      <tr class="next_tenses" id="TR_88">
        <td id="TD_89">
          you, we, they
        </td>
        <td id="TD_90">
          <span id="SPAN_91">are</span>
          <span id="SPAN_92">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_93">
        <td id="TD_94">
          Past
        </td>
      </tr>
      <tr class="next_tenses" id="TR_95">
        <td id="TD_96">
          I, he, she, it
        </td>
        <td id="TD_97">
          <span id="SPAN_98">was</span>
          <span id="SPAN_99">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_100">
      </tr>
      <tr class="next_tenses" id="TR_101">
        <td id="TD_102">
          you, we, they
        </td>
        <td id="TD_103">
          <span id="SPAN_104">were</span>
          <span id="SPAN_105">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_106">
        <td id="TD_107">
          Present perfect
        </td>
      </tr>
      <tr class="next_tenses" id="TR_108">
        <td id="TD_109">
          I, you, we, they
        </td>
        <td id="TD_110">
          <span id="SPAN_111">have been</span>
          <span id="SPAN_112">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_113">
      </tr>
      <tr class="next_tenses" id="TR_114">
        <td id="TD_115">
          he, she, it
        </td>
        <td id="TD_116">
          <span id="SPAN_117">has been</span>
          <span id="SPAN_118">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_119">
        <td id="TD_120">
          Past perfect
        </td>
      </tr>
      <tr class="next_tenses" id="TR_121">
        <td id="TD_122">
          I, you, he, she, it, we, they
        </td>
        <td id="TD_123">
          <span id="SPAN_124">had been</span>
          <span id="SPAN_125">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_126">
        <td id="TD_127">
          Future
        </td>
      </tr>
      <tr class="next_tenses" id="TR_128">
        <td id="TD_129">
          I, you, he, she, it, we, they
        </td>
        <td id="TD_130">
          <span id="SPAN_131">will be</span>
          <span id="SPAN_132">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr class="next_tenses" id="TR_133">
        <td id="TD_134">
          Future perfect
        </td>
      </tr>
      <tr class="next_tenses" id="TR_135">
        <td id="TD_136">
          I, you, he, she, it, we, they
        </td>
        <td id="TD_137">
          <span id="SPAN_138">will have been</span>
          <span id="SPAN_139">${elem.Inflections.present_participle}
          </span>
        </td>
      </tr>
      <tr id="TR_140" class="next_tenses">
        <td class="view_less" colspan="3" id="TD_141">
          <span id="SPAN_142">&gt; View Less</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>`
		}
	}
})
module.exports = {verbTable: verbTable}
