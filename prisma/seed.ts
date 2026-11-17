import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const OFFICIAL_PORTAL_CATEGORIES = [
  {
    slug: 'high-court',
    nameEn: 'Allahabad High Court & Lucknow Bench',
    nameHi: 'इलाहाबाद उच्च न्यायालय एवं लखनऊ पीठ',
    descriptionEn: 'Official High Court portals for case status, cause lists, eLegalix judgments, court calendars, and administrative notices.',
    descriptionHi: 'वाद स्थिति, वाद सूची (कॉज़ लिस्ट), ई-लीगलिक्स निर्णय, न्यायालय कैलेंडर और आधिकारिक सूचनाओं के लिए उच्च न्यायालय के पोर्टल।',
    sortOrder: 1,
    links: [
      {
        titleEn: 'Allahabad High Court (Main Official Portal)',
        titleHi: 'इलाहाबाद उच्च न्यायालय (मुख्य आधिकारिक वेबसाइट)',
        descriptionEn: 'Primary portal of the High Court of Judicature at Allahabad for notices, rules, cause lists, and court directories.',
        descriptionHi: 'इलाहाबाद उच्च न्यायालय का मुख्य पोर्टल — सूचनाएं, नियम, वाद सूची एवं न्यायालय निर्देशिका।',
        url: 'https://www.allahabadhighcourt.in',
        officialAgency: 'High Court of Judicature at Allahabad',
        requiredInputsEn: 'Select section manually (Cause List, Case Status, Calendar, or Notices).',
        requiredInputsHi: 'पोर्टल पर जाकर संबंधित अनुभाग (कॉज़ लिस्ट, केस स्टेटस, कैलेंडर या नोटिस) चुनें।',
        safetyNoteEn: 'External Official Website — Do not enter your personal desk password on external portals.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — किसी भी पोर्टल पर अपना निजी पासवर्ड या ओटीपी साझा न करें।',
        isFeatured: true,
        sortOrder: 1,
      },
      {
        titleEn: 'Lucknow Bench — Direct Portal & Case Status',
        titleHi: 'लखनऊ पीठ — सीधा पोर्टल एवं वाद स्थिति',
        descriptionEn: 'Dedicated Lucknow Bench services for Case Status, Daily Cause Lists, Fresh Lists, and Status Reports.',
        descriptionHi: 'लखनऊ पीठ के मुकदमों की स्थिति, दैनिक वाद सूची (कॉज़ लिस्ट) और स्टेटस रिपोर्ट देखने हेतु।',
        url: 'https://hclko.allahabadhighcourt.in',
        officialAgency: 'Allahabad High Court, Lucknow Bench',
        requiredInputsEn: 'Case Type, Case Number, Filing Year, Party Name, or Advocate Roll/Name.',
        requiredInputsHi: 'वाद प्रकार (Case Type), वाद संख्या, वर्ष, पक्षकार का नाम या अधिवक्ता का नाम दर्ज करें।',
        safetyNoteEn: 'Manual CAPTCHA verification is required on the official court website.',
        safetyNoteHi: 'आधिकारिक वेबसाइट पर मैन्युअल कैप्चा (CAPTCHA) दर्ज करना आवश्यक होता है।',
        isFeatured: true,
        sortOrder: 2,
      },
      {
        titleEn: 'eLegalix — High Court Orders & Judgments',
        titleHi: 'ई-लीगलिक्स — उच्च न्यायालय आदेश एवं निर्णय',
        descriptionEn: 'Search and download certified/uploaded judgments and daily orders of Allahabad High Court and Lucknow Bench.',
        descriptionHi: 'इलाहाबाद उच्च न्यायालय एवं लखनऊ पीठ के आदेश और निर्णय खोजने व डाउनलोड करने का आधिकारिक पोर्टल।',
        url: 'https://elegalix.allahabadhighcourt.in/',
        officialAgency: 'High Court of Judicature at Allahabad (eLegalix)',
        requiredInputsEn: 'Case Number, Hon’ble Judge Name, Petitioner/Respondent Name, or Judgment Date.',
        requiredInputsHi: 'वाद संख्या, माननीय न्यायाधीश का नाम, पक्षकार का नाम या निर्णय की तिथि दर्ज करें।',
        safetyNoteEn: 'External Official Website — Official High Court repository.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — उच्च न्यायालय का आधिकारिक संग्रह।',
        isFeatured: true,
        sortOrder: 3,
      },
      {
        titleEn: 'eCourts High Court Judgments Search',
        titleHi: 'ई-कोर्ट्स उच्च न्यायालय निर्णय खोज',
        descriptionEn: 'National eCommittee portal to search High Court judgments across India by Bench, Act, or keyword.',
        descriptionHi: 'राष्ट्रीय ई-समिति पोर्टल — खंडपीठ, अधिनियम या मुख्य शब्दों से निर्णय खोजें।',
        url: 'https://judgments.ecourts.gov.in',
        officialAgency: 'eCommittee, Supreme Court of India / NIC',
        requiredInputsEn: 'Select High Court (Allahabad), Bench (Lucknow), Case No., or Keyword.',
        requiredInputsHi: 'उच्च न्यायालय (इलाहाबाद), लखनऊ बेंच, वाद संख्या या मुख्य शब्द चुनें।',
        safetyNoteEn: 'External Official Website — Free public judgment archive.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — निःशुल्क सार्वजनिक निर्णय पोर्टल।',
        isFeatured: false,
        sortOrder: 4,
      },
    ],
  },
  {
    slug: 'civil-court',
    nameEn: 'Civil & District Court Services (Lucknow & eCourts)',
    nameHi: 'दीवानी एवं जनपद न्यायालय सेवाएँ (लखनऊ व ई-कोर्ट्स)',
    descriptionEn: 'Official eCourts and District Court Lucknow portals for CNR search, case history, cause lists, and court calendars.',
    descriptionHi: 'सीएनआर संख्या, वाद इतिहास, दैनिक वाद सूची और जनपद न्यायालय लखनऊ की सेवाओं के लिए आधिकारिक पोर्टल।',
    sortOrder: 2,
    links: [
      {
        titleEn: 'District Court Lucknow (Official Website)',
        titleHi: 'जनपद न्यायालय लखनऊ (आधिकारिक वेबसाइट)',
        descriptionEn: 'Official District & Sessions Court Lucknow portal for court notices, judicial officer directory, calendars, and local cause lists.',
        descriptionHi: 'जनपद एवं सत्र न्यायालय लखनऊ का आधिकारिक पोर्टल — नोटिस, कैलेंडर और न्यायालय सूची।',
        url: 'https://lucknow.dcourts.gov.in',
        officialAgency: 'District & Sessions Court, Lucknow',
        requiredInputsEn: 'Select Court Complex (Kaiserbagh / Collectorate / Mohanlalganj) or Notices.',
        requiredInputsHi: 'न्यायालय परिसर या सूचना अनुभाग चुनें।',
        safetyNoteEn: 'External Official Website — Official District Judiciary portal.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — जनपद न्यायपालिका का आधिकारिक पोर्टल।',
        isFeatured: true,
        sortOrder: 1,
      },
      {
        titleEn: 'eCourts Services (Case Status, CNR & History)',
        titleHi: 'ई-कोर्ट्स सेवाएँ (वाद स्थिति, सीएनआर एवं इतिहास)',
        descriptionEn: 'Search District & Taluka Court cases by 16-digit CNR Number, Party Name, Filing Number, Advocate Name, or FIR Number.',
        descriptionHi: '16-अंकीय सीएनआर (CNR) संख्या, पक्षकार के नाम, अधिवक्ता के नाम या एफआईआर संख्या से केस स्टेटस और इतिहास देखें।',
        url: 'https://services.ecourts.gov.in',
        officialAgency: 'eCommittee, Supreme Court of India (NIC)',
        requiredInputsEn: 'State (Uttar Pradesh), District (Lucknow), Court Complex, Case Number or 16-digit CNR + CAPTCHA.',
        requiredInputsHi: 'राज्य (उत्तर प्रदेश), जनपद (लखनऊ), न्यायालय परिसर, वाद संख्या या 16-अंकीय सीएनआर व कैप्चा दर्ज करें।',
        safetyNoteEn: 'Requires manual entry of Case/CNR details and CAPTCHA on the official website.',
        safetyNoteHi: 'आधिकारिक पोर्टल पर वाद/सीएनआर विवरण व कैप्चा स्वयं दर्ज करना होगा।',
        isFeatured: true,
        sortOrder: 2,
      },
      {
        titleEn: 'eCourts National Portal (Orders & Cause Lists)',
        titleHi: 'ई-कोर्ट्स राष्ट्रीय पोर्टल (आदेश एवं वाद सूची)',
        descriptionEn: 'Access district judiciary daily cause lists, court establishment listings, and judicial statistics.',
        descriptionHi: 'जिला न्यायालयों की दैनिक कॉज़ लिस्ट, कोर्ट एस्टैब्लिशमेंट और आदेश देखने का मुख्य पोर्टल।',
        url: 'https://ecourts.gov.in',
        officialAgency: 'Department of Justice / eCommittee',
        requiredInputsEn: 'Select State (Uttar Pradesh) -> District (Lucknow) -> Court Establishment.',
        requiredInputsHi: 'राज्य (उत्तर प्रदेश) -> जनपद (लखनऊ) -> न्यायालय प्रतिष्ठान चुनें।',
        safetyNoteEn: 'External Official Website — Never save court login credentials in browser autofill on shared computers.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — साझा कंप्यूटर पर लॉगिन जानकारी सेव न करें।',
        isFeatured: false,
        sortOrder: 3,
      },
    ],
  },
  {
    slug: 'land-records',
    nameEn: 'UP Land Records & Revenue Courts',
    nameHi: 'उत्तर प्रदेश भूलेख एवं राजस्व न्यायालय',
    descriptionEn: 'Official UP Bhulekh, BhuNaksha, Board of Revenue (Vaad/RCCMS), and Stamp & Registration (IGRS UP) portals.',
    descriptionHi: 'खतौनी नकल, गाटा/खसरा नक्शा, राजस्व वाद (नायब तहसीलदार/तहसीलदार/एसडीएम) व रजिस्ट्री सेवाओं के आधिकारिक पोर्टल।',
    sortOrder: 3,
    links: [
      {
        titleEn: 'UP Bhulekh (Khatauni & Gata / Khasra Search)',
        titleHi: 'यूपी भूलेख (खतौनी नकल एवं गाटा/खसरा विवरण)',
        descriptionEn: 'View Khatauni (Record of Rights), Gata/Khasra status, unique land code, and real-time Khatauni copy.',
        descriptionHi: 'जनपद, तहसील और ग्राम चुनकर खतौनी की नकल, गाटा/खसरा संख्या व खातेदार विवरण देखें।',
        url: 'https://upbhulekh.gov.in',
        officialAgency: 'Board of Revenue, Government of Uttar Pradesh',
        requiredInputsEn: 'Select District (जनपद) -> Tehsil (तहसील) -> Village (ग्राम), then enter Khasra/Gata No., Khata No., or Name + CAPTCHA.',
        requiredInputsHi: 'जनपद -> तहसील -> ग्राम चुनें, फिर खसरा/गाटा संख्या, खाता संख्या या खातेदार का नाम व कैप्चा दर्ज करें।',
        safetyNoteEn: 'Note: Online copy is for information; certified Khatauni for court filing requires Tehsil/CSC digitally signed copy.',
        safetyNoteHi: 'नोट: ऑनलाइन प्रति केवल जानकारी हेतु है; न्यायालय में दाखिल करने के लिए तहसील/जनसेवा केंद्र से डिजिटल हस्ताक्षरित प्रमाणित खतौनी लें।',
        isFeatured: true,
        sortOrder: 1,
      },
      {
        titleEn: 'Vaad UP / RCCMS (Nayab Tehsildar & Revenue Courts)',
        titleHi: 'वाद यूपी / आरसीसीएमएस (नायब तहसीलदार एवं राजस्व न्यायालय)',
        descriptionEn: 'Track mutation (Daakhil-Kharij), Section 34/24/116 cases, cause lists, and orders before Nayab Tehsildar, Tehsildar, SDM & Commissioner.',
        descriptionHi: 'नायब तहसीलदार, तहसीलदार, एसडीएम, डीएम व कमिश्नर न्यायालय में दाखिल-खारिज, पैमाइश और राजस्व वादों की स्थिति व आदेश देखें।',
        url: 'https://vaad.up.nic.in',
        officialAgency: 'Board of Revenue, Uttar Pradesh (RCCMS)',
        requiredInputsEn: 'Select Court Level (Nayab Tehsildar / Tehsildar / SDM), District, Tehsil, and Case No. or Computerized Case No.',
        requiredInputsHi: 'न्यायालय स्तर (नायब तहसीलदार / तहसीलदार / एसडीएम), जनपद, तहसील व वाद संख्या या कंप्यूटरीकृत वाद संख्या दर्ज करें।',
        safetyNoteEn: 'External Official Website — Official UP Revenue Court tracking system.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — उ.प्र. राजस्व न्यायालय वाद ट्रैकिंग प्रणाली।',
        isFeatured: true,
        sortOrder: 2,
      },
      {
        titleEn: 'UP BhuNaksha (Cadastral Plot Map)',
        titleHi: 'यूपी भू-नक्शा (गाटा/खसरा मानचित्र)',
        descriptionEn: 'Inspect digital village parcel maps, plot boundaries, and Gata dimensions by District, Tehsil, and Village.',
        descriptionHi: 'ग्राम के डिजिटल मानचित्र पर गाटा संख्या, सीमाएँ और क्षेत्रफल विवरण देखें।',
        url: 'https://upbhunaksha.gov.in',
        officialAgency: 'Revenue Department, Government of Uttar Pradesh',
        requiredInputsEn: 'Select District, Tehsil, Village, and click Plot/Gata Number.',
        requiredInputsHi: 'जनपद, तहसील, ग्राम चुनें और मानचित्र पर गाटा संख्या पर क्लिक करें।',
        safetyNoteEn: 'External Official Website — Boundaries are indicative; physical demarcation (Paimaish) requires Section 24 application at Tehsil.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — वास्तविक पैमाइश/हदबंदी हेतु तहसील में धारा 24 के अंतर्गत आवेदन आवश्यक होता है।',
        isFeatured: false,
        sortOrder: 3,
      },
      {
        titleEn: 'IGRS UP (Property Registration & Stamp Duty)',
        titleHi: 'आईजीआरएस यूपी (संपत्ति पंजीकरण एवं स्टाम्प शुल्क)',
        descriptionEn: 'Verify registered deeds, check circle rates, book Sub-Registrar slots, and verify e-Stamps in Uttar Pradesh.',
        descriptionHi: 'बैनामा/रजिस्ट्री विवरण, सर्किल रेट, उप-निबंधक कार्यालय अपॉइंटमेंट और स्टाम्प शुल्क की जांच हेतु।',
        url: 'https://igrsup.gov.in',
        officialAgency: 'Stamp & Registration Department, UP',
        requiredInputsEn: 'District, Sub-Registrar Office, Deed Registration Year & Number (or Property Details).',
        requiredInputsHi: 'जनपद, उप-निबंधक कार्यालय, पंजीकरण वर्ष एवं दस्तावेज़ संख्या दर्ज करें।',
        safetyNoteEn: 'External Official Website — Never share OTPs or citizen login passwords.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट — ओटीपी व लॉगिन पासवर्ड किसी से साझा न करें।',
        isFeatured: false,
        sortOrder: 4,
      },
      {
        titleEn: 'Board of Revenue UP (Circulars & Orders)',
        titleHi: 'राजस्व परिषद उत्तर प्रदेश (शासनादेश एवं परिपत्र)',
        descriptionEn: 'Official Board of Revenue portal for UP Revenue Code rules, notifications, and administrative orders.',
        descriptionHi: 'उत्तर प्रदेश राजस्व संहिता नियमावली, परिपत्र और आधिकारिक सूचनाएं।',
        url: 'https://bor.up.gov.in',
        officialAgency: 'Board of Revenue, Uttar Pradesh',
        requiredInputsEn: 'Browse circulars, notifications, or revenue administration sections.',
        requiredInputsHi: 'शासनादेश, नियम और परिपत्र अनुभाग देखें।',
        safetyNoteEn: 'External Official Website.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट।',
        isFeatured: false,
        sortOrder: 5,
      },
    ],
  },
  {
    slug: 'e-district',
    nameEn: 'e-District UP & Government Certificates',
    nameHi: 'ई-डिस्ट्रिक्ट उत्तर प्रदेश एवं प्रमाणपत्र सेवाएँ',
    descriptionEn: 'Official e-District UP and e-Sathi portals for Domicile, Caste, Income certificates, application status, and verification.',
    descriptionHi: 'निवास, जाति, आय प्रमाणपत्र आवेदन, स्थिति जांच व प्रमाणपत्र सत्यापन के लिए आधिकारिक ई-डिस्ट्रिक्ट व ई-साथी पोर्टल।',
    sortOrder: 4,
    links: [
      {
        titleEn: 'e-District UP (Main Portal — Verification & Status)',
        titleHi: 'ई-डिस्ट्रिक्ट यूपी (मुख्य पोर्टल — आवेदन स्थिति एवं सत्यापन)',
        descriptionEn: 'Verify issued Domicile, Caste, Income, and Birth/Death certificates and track application status by Application Number.',
        descriptionHi: 'आवेदन संख्या से प्रमाणपत्र की स्थिति जांचें तथा जारी प्रमाणपत्र संख्या से ऑनलाइन सत्यापन करें।',
        url: 'https://edistrict.up.gov.in',
        officialAgency: 'Department of Information Technology & Electronics, UP',
        requiredInputsEn: 'For Status: Application Number. For Verification: Application Number + Certificate ID.',
        requiredInputsHi: 'स्थिति जानने हेतु आवेदन संख्या; सत्यापन हेतु आवेदन संख्या व प्रमाणपत्र आईडी दर्ज करें।',
        safetyNoteEn: 'Security Warning: Never share your CSC/e-District password or OTP with anyone. This desk never issues certificates.',
        safetyNoteHi: 'सुरक्षा चेतावनी: अपना सीएससी/ई-डिस्ट्रिक्ट पासवर्ड या ओटीपी किसी को न बताएं। यह डेस्क स्वयं प्रमाणपत्र जारी नहीं करता।',
        isFeatured: true,
        sortOrder: 1,
      },
      {
        titleEn: 'e-Sathi UP (Citizen Login for Certificate Applications)',
        titleHi: 'ई-साथी यूपी (प्रमाणपत्र आवेदन हेतु नागरिक पोर्टल)',
        descriptionEn: 'Official UP citizen service portal to apply online for Domicile (निवास), Caste (जाति), Income (आय), and Khatauni services.',
        descriptionHi: 'निवास, जाति, आय प्रमाणपत्र एवं अन्य सेवाओं के ऑनलाइन आवेदन के लिए उत्तर प्रदेश सरकार का ई-साथी पोर्टल।',
        url: 'https://esathi.up.gov.in',
        officialAgency: 'Government of Uttar Pradesh (e-Sathi)',
        requiredInputsEn: 'Citizen login ID/OTP, applicant Aadhaar/photo, self-declaration form, and address/income proof.',
        requiredInputsHi: 'नागरिक लॉगिन आईडी/ओटीपी, आवेदक फोटो, स्वप्रमाणित घोषणा पत्र व आवश्यक पते/आय के प्रमाण।',
        safetyNoteEn: 'Security Warning: Log in only on esathi.up.gov.in. Never enter your government OTP or password inside third-party apps.',
        safetyNoteHi: 'सुरक्षा चेतावनी: केवल आधिकारिक वेबसाइट esathi.up.gov.in पर ही लॉगिन करें। किसी अन्य ऐप में ओटीपी दर्ज न करें।',
        isFeatured: true,
        sortOrder: 2,
      },
    ],
  },
  {
    slug: 'legal-reference',
    nameEn: 'Statutory Acts & Bar Council',
    nameHi: 'अधिनियम एवं बार काउंसिल संसाधन',
    descriptionEn: 'Official repositories for Central & State Bare Acts and Bar Council of Uttar Pradesh.',
    descriptionHi: 'केंद्रीय व राज्य अधिनियम (Bare Acts) और बार काउंसिल ऑफ उत्तर प्रदेश के आधिकारिक पोर्टल।',
    sortOrder: 5,
    links: [
      {
        titleEn: 'India Code (Official Central & UP Bare Acts)',
        titleHi: 'इंडिया कोड (आधिकारिक केंद्रीय एवं राज्य अधिनियम)',
        descriptionEn: 'Search and download authentic Central Acts, UP State Acts, BNS, BNSS, BSA, CPC, and UP Revenue Code.',
        descriptionHi: 'केंद्रीय एवं उत्तर प्रदेश राज्य के सभी प्रामाणिक अधिनियम (BNS, BNSS, BSA, CPC, राजस्व संहिता) डाउनलोड करें।',
        url: 'https://www.indiacode.nic.in',
        officialAgency: 'Ministry of Law and Justice, Government of India',
        requiredInputsEn: 'Search by Act Title, Year, or Ministry/State (Uttar Pradesh).',
        requiredInputsHi: 'अधिनियम का नाम, वर्ष या राज्य (उत्तर प्रदेश) चुनकर खोजें।',
        safetyNoteEn: 'External Official Website.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट।',
        isFeatured: false,
        sortOrder: 1,
      },
      {
        titleEn: 'Bar Council of Uttar Pradesh',
        titleHi: 'बार काउंसिल ऑफ उत्तर प्रदेश',
        descriptionEn: 'Official Bar Council of UP portal for advocate enrollment, COP verification, and welfare schemes.',
        descriptionHi: 'अधिवक्ता पंजीकरण, सीओपी (COP) सत्यापन एवं अधिवक्ता कल्याण योजनाओं की आधिकारिक वेबसाइट।',
        url: 'https://barcouncilofuttarpradesh.org',
        officialAgency: 'Bar Council of Uttar Pradesh',
        requiredInputsEn: 'Enrollment Number / Year or Welfare Scheme section.',
        requiredInputsHi: 'पंजीकरण संख्या / वर्ष या कल्याण योजना अनुभाग।',
        safetyNoteEn: 'External Official Website.',
        safetyNoteHi: 'बाहरी आधिकारिक वेबसाइट।',
        isFeatured: false,
        sortOrder: 2,
      },
    ],
  },
];

export async function seedDatabase(prismaClient: PrismaClient = prisma) {
  // 1. Upsert Portal Categories & Links
  const createdLinks: { id: string; titleEn: string; url: string; categorySlug: string }[] = [];

  for (const catData of OFFICIAL_PORTAL_CATEGORIES) {
    const category = await prismaClient.portalCategory.upsert({
      where: { slug: catData.slug },
      update: {
        nameEn: catData.nameEn,
        nameHi: catData.nameHi,
        descriptionEn: catData.descriptionEn,
        descriptionHi: catData.descriptionHi,
        sortOrder: catData.sortOrder,
      },
      create: {
        slug: catData.slug,
        nameEn: catData.nameEn,
        nameHi: catData.nameHi,
        descriptionEn: catData.descriptionEn,
        descriptionHi: catData.descriptionHi,
        sortOrder: catData.sortOrder,
      },
    });

    const existingLinks = await prismaClient.portalLink.findMany({
      where: { categoryId: category.id },
    });

    for (const linkData of catData.links) {
      const match = existingLinks.find((l) => l.url === linkData.url);
      if (match) {
        const updated = await prismaClient.portalLink.update({
          where: { id: match.id },
          data: {
            titleEn: linkData.titleEn,
            titleHi: linkData.titleHi,
            descriptionEn: linkData.descriptionEn,
            descriptionHi: linkData.descriptionHi,
            officialAgency: linkData.officialAgency,
            requiredInputsEn: linkData.requiredInputsEn,
            requiredInputsHi: linkData.requiredInputsHi,
            safetyNoteEn: linkData.safetyNoteEn,
            safetyNoteHi: linkData.safetyNoteHi,
            isFeatured: linkData.isFeatured,
            sortOrder: linkData.sortOrder,
          },
        });
        createdLinks.push({ id: updated.id, titleEn: updated.titleEn, url: updated.url, categorySlug: catData.slug });
      } else {
        const created = await prismaClient.portalLink.create({
          data: {
            categoryId: category.id,
            titleEn: linkData.titleEn,
            titleHi: linkData.titleHi,
            descriptionEn: linkData.descriptionEn,
            descriptionHi: linkData.descriptionHi,
            url: linkData.url,
            officialAgency: linkData.officialAgency,
            requiredInputsEn: linkData.requiredInputsEn,
            requiredInputsHi: linkData.requiredInputsHi,
            safetyNoteEn: linkData.safetyNoteEn,
            safetyNoteHi: linkData.safetyNoteHi,
            isFeatured: linkData.isFeatured,
            sortOrder: linkData.sortOrder,
          },
        });
        createdLinks.push({ id: created.id, titleEn: created.titleEn, url: created.url, categorySlug: catData.slug });
      }
    }
  }

  // 2. Create fictional sample Advocate user (only if not exists)
  const demoEmail = 'advocate.sharma@example.in';
  let demoUser = await prismaClient.user.findUnique({ where: { email: demoEmail } });

  if (!demoUser) {
    const passwordHash = await bcrypt.hash('LucknowChambers#2026', 12);
    demoUser = await prismaClient.user.create({
      data: {
        email: demoEmail,
        name: 'Adv. Rajeshwar Prasad Sharma (Sample Demo)',
        enrollmentNo: 'UP/04192/2004 (Sample)',
        chamberAddress: 'Chamber No. 412, High Court Lucknow Bench, Vibhuti Khand, Gomti Nagar, Lucknow (Sample)',
        phone: '+91-98000-00001',
        passwordHash,
        reminderLeadMinutes: 60,
        preferredLanguage: 'EN_HI',
      },
    });

    // Helper for IST dates relative to today
    const now = new Date();
    const todayAt = (hour: number, min: number) => {
      const d = new Date(now);
      d.setHours(hour, min, 0, 0);
      return d;
    };
    const daysFromNow = (days: number, hour = 10, min = 30) => {
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      d.setHours(hour, min, 0, 0);
      return d;
    };

    // 3. Seed Fictional Clients
    const client1 = await prismaClient.client.create({
      data: {
        userId: demoUser.id,
        fullName: 'Mahesh Kumar Verma (Sample Fictional Client)',
        fatherOrSpouseName: 'Late Shri Ram Swaroop Verma',
        phone: '+91-90000-11101',
        email: 'mahesh.verma.sample@example.in',
        address: 'House 14/8, Indira Nagar, Lucknow (Fictional Address)',
        city: 'Lucknow',
        district: 'Lucknow',
        privateNotes: 'Sample fictional record for demonstration. Land mutation and writ follow-up.',
      },
    });

    const client2 = await prismaClient.client.create({
      data: {
        userId: demoUser.id,
        fullName: 'Sunita Devi Tiwari (Sample Fictional Client)',
        fatherOrSpouseName: 'Shri Harish Chandra Tiwari',
        phone: '+91-90000-22202',
        address: 'Gram Chinhat, Tehsil Sadar, Lucknow (Fictional Address)',
        city: 'Lucknow',
        district: 'Lucknow',
        privateNotes: 'Sample fictional record for Civil Suit injunction matter.',
      },
    });

    const client3 = await prismaClient.client.create({
      data: {
        userId: demoUser.id,
        fullName: 'Anil Pratap Singh (Sample Fictional Client)',
        fatherOrSpouseName: 'Shri Bhanu Pratap Singh',
        phone: '+91-90000-33303',
        address: 'Alambagh, Lucknow (Fictional Address)',
        city: 'Lucknow',
        district: 'Lucknow',
        privateNotes: 'Sample fictional record for Revenue Court Nayab Tehsildar mutation case.',
      },
    });

    // 4. Seed Fictional Cases
    const case1 = await prismaClient.case.create({
      data: {
        userId: demoUser.id,
        clientId: client1.id,
        internalCode: 'DEMO-HC-2026-001',
        title: 'Mahesh Kumar Verma vs. State of U.P. & Ors. (Sample)',
        caseNumber: 'WRIT-C No. 4182 of 2026 (Sample)',
        cnrNumber: 'UPHC020041822026',
        courtName: 'Allahabad High Court, Lucknow Bench',
        courtType: 'HIGH_COURT',
        caseCategory: 'Writ Petition (Civil)',
        petitioner: 'Mahesh Kumar Verma (Fictional)',
        respondent: 'State of U.P. through Principal Secretary Revenue & Ors.',
        filingDate: daysFromNow(-45),
        previousHearingDate: daysFromNow(-12),
        nextHearingDate: todayAt(10, 30),
        status: 'PENDING',
        privateNotes: 'Sample advocate note: Counter-affidavit reply drafted. Verify latest cause list on hclko.allahabadhighcourt.in.',
      },
    });

    const case2 = await prismaClient.case.create({
      data: {
        userId: demoUser.id,
        clientId: client2.id,
        internalCode: 'DEMO-CIV-2026-002',
        title: 'Sunita Devi Tiwari vs. Rameshwar Dayal (Sample)',
        caseNumber: 'O.S. No. 314 of 2025 (Sample)',
        cnrNumber: 'UPLK050003142025',
        courtName: 'Civil Judge (Senior Division), Lucknow',
        courtType: 'CIVIL_COURT',
        caseCategory: 'Original Suit (Permanent Injunction)',
        petitioner: 'Sunita Devi Tiwari (Fictional)',
        respondent: 'Rameshwar Dayal (Fictional)',
        filingDate: daysFromNow(-180),
        previousHearingDate: daysFromNow(-20),
        nextHearingDate: daysFromNow(2, 11, 0),
        status: 'PENDING',
        privateNotes: 'Sample advocate note: Plaintiff evidence (PW-1) affidavit ready. Check eCourts CNR manually before hearing.',
      },
    });

    const case3 = await prismaClient.case.create({
      data: {
        userId: demoUser.id,
        clientId: client3.id,
        internalCode: 'DEMO-REV-2026-003',
        title: 'Anil Pratap Singh vs. Gram Sabha Chinhat (Sample)',
        caseNumber: 'T202610460201999 (Sample)',
        courtName: 'Court of Nayab Tehsildar, Tehsil Sadar, Lucknow',
        courtType: 'REVENUE_COURT',
        caseCategory: 'Mutation (Daakhil-Kharij u/s 34)',
        petitioner: 'Anil Pratap Singh (Fictional)',
        respondent: 'Gram Sabha / Land Management Committee',
        filingDate: daysFromNow(-60),
        previousHearingDate: daysFromNow(-14),
        nextHearingDate: daysFromNow(5, 14, 0),
        status: 'PENDING',
        privateNotes: 'Sample advocate note: Certified Khatauni & sale deed copy attached. Track RCCMS status on vaad.up.nic.in.',
      },
    });

    const case4 = await prismaClient.case.create({
      data: {
        userId: demoUser.id,
        clientId: client1.id,
        internalCode: 'DEMO-CIV-2025-004',
        title: 'Mahesh Kumar Verma vs. Lucknow Development Authority (Sample)',
        caseNumber: 'Misc. Appeal No. 89 of 2025 (Sample)',
        courtName: 'District Judge Court, Kaiserbagh, Lucknow',
        courtType: 'CIVIL_COURT',
        caseCategory: 'Miscellaneous Civil Appeal',
        petitioner: 'Mahesh Kumar Verma (Fictional)',
        respondent: 'Lucknow Development Authority',
        filingDate: daysFromNow(-300),
        previousHearingDate: daysFromNow(-30),
        status: 'DISPOSED',
        privateNotes: 'Sample advocate note: Disposed in favour of appellant (fictional record).',
      },
    });

    // 5. Seed Hearings
    const h1 = await prismaClient.hearing.create({
      data: {
        userId: demoUser.id,
        caseId: case1.id,
        hearingDate: todayAt(10, 30),
        courtRoom: 'Court No. 14 (Lucknow Bench)',
        benchOrJudge: 'Division Bench (Sample)',
        purpose: 'Admission & Counter Affidavit Consideration',
        status: 'SCHEDULED',
      },
    });

    await prismaClient.hearing.create({
      data: {
        userId: demoUser.id,
        caseId: case2.id,
        hearingDate: daysFromNow(2, 11, 0),
        courtRoom: 'Civil Judge (Sr. Div.) Room 04',
        purpose: 'Filing of PW-1 Affidavit & Original Documents',
        status: 'SCHEDULED',
      },
    });

    await prismaClient.hearing.create({
      data: {
        userId: demoUser.id,
        caseId: case3.id,
        hearingDate: daysFromNow(5, 14, 0),
        courtRoom: 'Tehsil Sadar — Nayab Tehsildar Court',
        purpose: 'Verification of Proclamation & Khatauni Report',
        status: 'SCHEDULED',
      },
    });

    // 6. Seed Case Notes
    await prismaClient.caseNote.create({
      data: {
        userId: demoUser.id,
        caseId: case1.id,
        title: 'Checklist before Lucknow Bench hearing (Sample)',
        content: '1. Carry two copies of Rejoinder Affidavit.\n2. Verify daily cause list serial number on hclko.allahabadhighcourt.in.\n3. Confirm client copy of Khatauni from UP Bhulekh.',
        isPrivate: true,
      },
    });

    // 7. Seed Tasks (including 1 overdue task so overdue highlighting works out-of-the-box)
    const t1 = await prismaClient.task.create({
      data: {
        userId: demoUser.id,
        caseId: case1.id,
        clientId: client1.id,
        title: 'Prepare Rejoinder Affidavit two-set binding (Sample)',
        description: 'Review paragraphs 4–9 and get client verification before court sitting.',
        dueDate: todayAt(9, 30),
        priority: 'HIGH',
        isCompleted: false,
      },
    });

    await prismaClient.task.create({
      data: {
        userId: demoUser.id,
        caseId: case2.id,
        clientId: client2.id,
        title: 'Collect certified copy of Tehsil Khatauni (Sample)',
        description: 'Required to file along with application under Order 39 Rule 1 & 2 CPC.',
        dueDate: daysFromNow(-1, 17, 0),
        priority: 'HIGH',
        isCompleted: false,
      },
    });

    await prismaClient.task.create({
      data: {
        userId: demoUser.id,
        caseId: case3.id,
        clientId: client3.id,
        title: 'Check RCCMS Vaad order sheet on vaad.up.nic.in (Sample)',
        description: 'Verify whether Lekhpal report has been uploaded.',
        dueDate: daysFromNow(3, 12, 0),
        priority: 'MEDIUM',
        isCompleted: false,
      },
    });

    // 8. Seed Reminders
    await prismaClient.reminder.create({
      data: {
        userId: demoUser.id,
        caseId: case1.id,
        hearingId: h1.id,
        title: "Today's High Court Hearing — WRIT-C No. 4182/2026 (Sample)",
        message: 'Scheduled at 10:30 AM IST in Lucknow Bench (Court No. 14). Check official cause list before appearance.',
        remindAt: todayAt(9, 0),
        channel: 'IN_APP',
        isRead: false,
      },
    });

    await prismaClient.reminder.create({
      data: {
        userId: demoUser.id,
        caseId: case2.id,
        taskId: t1.id,
        title: 'Upcoming Civil Court Hearing in 2 Days (Sample)',
        message: 'O.S. No. 314/2025 — PW-1 Affidavit preparation due.',
        remindAt: daysFromNow(1, 18, 0),
        channel: 'IN_APP',
        isRead: false,
      },
    });

    // 9. Seed Official Bookmarks for Demo User
    const mapCategory = (slug: string) => {
      if (slug === 'high-court') return 'HIGH_COURT';
      if (slug === 'civil-court') return 'CIVIL_COURT';
      if (slug === 'land-records') return 'LAND_RECORDS';
      if (slug === 'e-district') return 'E_DISTRICT';
      return 'OTHER';
    };

    for (const link of createdLinks.slice(0, 8)) {
      await prismaClient.bookmark.create({
        data: {
          userId: demoUser.id,
          portalLinkId: link.id,
          title: link.titleEn,
          url: link.url,
          category: mapCategory(link.categorySlug),
          isOfficial: true,
          notes: 'Verified official government/court portal',
        },
      });
    }

    await prismaClient.activityLog.create({
      data: {
        userId: demoUser.id,
        action: 'SYSTEM_SEED',
        entityType: 'USER',
        entityId: demoUser.id,
        summary: 'Sample fictional demonstration workspace initialized.',
      },
    });
  }

  return { seededCategories: OFFICIAL_PORTAL_CATEGORIES.length, demoEmail };
}

// Run when executed directly via tsx prisma/seed.ts
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then((res) => {
      console.log('Seed completed:', res);
      return prisma.$disconnect();
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
