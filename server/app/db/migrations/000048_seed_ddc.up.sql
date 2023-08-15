DROP TABLE IF EXISTS catalog.ddc;
CREATE TABLE catalog.ddc (
  name text,
  number text,
  search_vector tsvector generated always as ( 
    setweight(to_tsvector('english', name), 'A')   
    || ' ' ||
    setweight(to_tsvector('simple', number), 'B') ::tsvector
) stored
);
INSERT INTO catalog.ddc(name, number) VALUES
('Computer science, information & general works','000'),
('Knowledge','001'),
('The book','002'),
('Systems','003'),
('Data processing & computer science','004'),
('Computer programming, programs & data','005'),
('Special computer methods','006'),
('Unassigned','007'),
('Unassigned','008'),
('Unassigned','009'),
('Bibliography','010'),
('Bibliographies','011'),
('Bibliographies of individuals','012'),
('Unassigned','013'),
('Bibliographies of anonymous & pseudonymous works','014'),
('Bibliographies of works from specific places','015'),
('Bibliographies of works on specific subjects','016'),
('General subject catalogs','017'),
('Catalogs arranged by author, date, etc.','018'),
('Dictionary catalogs','019'),
('Library & information sciences','020'),
('Library relationships','021'),
('Administration of physical plant','022'),
('Personnel management','023'),
('Unassigned','024'),
('Library operations','025'),
('Libraries for specific subjects','026'),
('General libraries','027'),
('Reading & use of other information media','028'),
('Unassigned','029'),
('General encyclopedic works','030'),
('Encyclopedias in American English','031'),
('Encyclopedias in English','032'),
('Encyclopedias in other Germanic languages','033'),
('Encyclopedias in French, Occitan & Catalan','034'),
('Encyclopedias in Italian, Romanian & related languages','035'),
('Encyclopedias in Spanish & Portuguese','036'),
('Encyclopedias in Slavic languages','037'),
('Encyclopedias in Scandinavian languages','038'),
('Encyclopedias in other languages','039'),
('Unassigned','040'),
('Unassigned','041'),
('Unassigned','042'),
('Unassigned','043'),
('Unassigned','044'),
('Unassigned','045'),
('Unassigned','046'),
('Unassigned','047'),
('Unassigned','048'),
('Unassigned','049'),
('General serial publications','050'),
('Serials in American English','051'),
('Serials in English','052'),
('Serials in other Germanic languages','053'),
('Serials in French, Occitan & Catalan','054'),
('Serials in Italian, Romanian & related languages','055'),
('Serials in Spanish & Portuguese','056'),
('Serials in Slavic languages','057'),
('Serials in Scandinavian languages','058'),
('Serials in other languages','059'),
('General organizations & museum science','060'),
('Organizations in North America','061'),
('Organizations in British Isles; in England','062'),
('Organizations in central Europe; in Germany','063'),
('Organizations in France & Monaco','064'),
('Organizations in Italy & adjacent islands','065'),
('Organizations in Iberian Peninsula & adjacent islands','066'),
('Organizations in eastern Europe; in Russia','067'),
('Organizations in other geographic areas','068'),
('Museum science','069'),
('News media, journalism & publishing','070'),
('Newspapers in North America','071'),
('Newspapers in British Isles; in England','072'),
('Newspapers in central Europe; in Germany','073'),
('Newspapers in France & Monaco','074'),
('Newspapers in Italy & adjacent islands','075'),
('Newspapers in Iberian Peninsula & adjacent islands','076'),
('Newspapers in eastern Europe; in Russia','077'),
('Newspapers in Scandinavia','078'),
('Newspapers in other geographic areas','079'),
('General collections','080'),
('Collections in American English','081'),
('Collections in English','082'),
('Collections in other Germanic languages','083'),
('Collections in French, Occitan & Catalan','084'),
('Collections in Italian, Romanian & related languages','085'),
('Collections in Spanish & Portuguese','086'),
('Collections in Slavic languages','087'),
('Collections in Scandinavian languages','088'),
('Collections in other languages','089'),
('Manuscripts & rare books','090'),
('Manuscripts','091'),
('Block books','092'),
('Incunabula','093'),
('Printed books','094'),
('Books notable for bindings','095'),
('Books notable for illustrations','096'),
('Books notable for ownership or origin','097'),
('Prohibited works, forgeries & hoaxes','098'),
('Books notable for format','099'),
('Philosophy & psychology','100'),
('Theory of philosophy','101'),
('Miscellany','102'),
('Dictionaries & encyclopedias','103'),
('Unassigned','104'),
('Serial publications','105'),
('Organizations & management','106'),
('Education, research & related topics','107'),
('Kinds of persons treatment','108'),
('Historical & collected persons treatment','109'),
('Metaphysics','110'),
('Ontology','111'),
('Unassigned','112'),
('Cosmology','113'),
('Space','114'),
('Time','115'),
('Change','116'),
('Structure','117'),
('Force & energy','118'),
('Number & quantity','119'),
('Epistemology, causation & humankind','120'),
('Epistemology','121'),
('Causation','122'),
('Determinism & indeterminism','123'),
('Teleology','124'),
('Unassigned','125'),
('The self','126'),
('The unconscious & the subconscious','127'),
('Humankind','128'),
('Origin & destiny of individual souls','129'),
('Parapsychology & occultism','130'),
('Parapsychological & occult methods','131'),
('Unassigned','132'),
('Specific topics in parapsychology & occultism','133'),
('Unassigned','134'),
('Dreams & mysteries','135'),
('Unassigned','136'),
('Divinatory graphology','137'),
('Physiognomy','138'),
('Phrenology','139'),
('Specific philosophical schools','140'),
('Idealism & related systems','141'),
('Critical philosophy','142'),
('Bergsonism & intuitionism','143'),
('Humanism & related systems','144'),
('Sensationalism','145'),
('Naturalism & related systems','146'),
('Pantheism & related systems','147'),
('Eclecticism, liberalism & traditionalism','148'),
('Other philosophical systems','149'),
('Psychology','150'),
('Unassigned','151'),
('Perception, movement, emotions & drives','152'),
('Mental processes & intelligence','153'),
('Subconscious & altered states','154'),
('Differential & developmental psychology','155'),
('Comparative psychology','156'),
('Unassigned','157'),
('Applied psychology','158'),
('Unassigned','159'),
('Logic','160'),
('Induction','161'),
('Deduction','162'),
('Unassigned','163'),
('Unassigned','164'),
('Fallacies & sources of error','165'),
('Syllogisms','166'),
('Hypotheses','167'),
('Argument & persuasion','168'),
('Analogy','169'),
('Ethics','170'),
('Ethical systems','171'),
('Political ethics','172'),
('Ethics of family relationships','173'),
('Occupational ethics','174'),
('Ethics of recreation & leisure','175'),
('Ethics of sex & reproduction','176'),
('Ethics of social relations','177'),
('Ethics of consumption','178'),
('Other ethical norms','179'),
('Ancient, medieval & eastern philosophy','180'),
('Eastern philosophy','181'),
('Pre-Socratic Greek philosophies','182'),
('Socratic & related philosophies','183'),
('Platonic philosophy','184'),
('Aristotelian philosophy','185'),
('Skeptic & Neoplatonic philosophies','186'),
('Epicurean philosophy','187'),
('Stoic philosophy','188'),
('Medieval western philosophy','189'),
('Modern western philosophy','190'),
('Philosophy of United States & Canada','191'),
('Philosophy of British Isles','192'),
('Philosophy of Germany & Austria','193'),
('Philosophy of France','194'),
('Philosophy of Italy','195'),
('Philosophy of Spain & Portugal','196'),
('Philosophy of former Soviet Union','197'),
('Philosophy of Scandinavia','198'),
('Philosophy in other geographic areas','199'),
('Religion','200'),
('Religious mythology & social theology','201'),
('Doctrines','202'),
('Public worship & other practices','203'),
('Religious experience, life & practice','204'),
('Religious ethics','205'),
('Leaders & organization','206'),
('Missions & religious education','207'),
('Sources','208'),
('Sects & reform movements','209'),
('Philosophy & theory of religion','210'),
('Concepts of God','211'),
('Existence, knowability & attributes of God','212'),
('Creation','213'),
('Theodicy','214'),
('Science & religion','215'),
('Unassigned','216'),
('Unassigned','217'),
('Humankind','218'),
('Unassigned','219'),
('Bible','220'),
('Old Testament (Tanakh)','221'),
('Historical books of Old Testament','222'),
('Poetic books of Old Testament','223'),
('Prophetic books of Old Testament','224'),
('New Testament','225'),
('Gospels & Acts','226'),
('Epistles','227'),
('Revelation (Apocalypse)','228'),
('Apocrypha & pseudepigrapha','229'),
('Christianity & Christian theology','230'),
('God','231'),
('Jesus Christ & his family','232'),
('Humankind','233'),
('Salvation & grace','234'),
('Spiritual beings','235'),
('Eschatology','236'),
('Unassigned','237'),
('Creeds & catechisms','238'),
('Apologetics & polemics','239'),
('Christian moral & devotional theology','240'),
('Christian ethics','241'),
('Devotional literature','242'),
('Evangelistic writings for individuals','243'),
('Unassigned','244'),
('Unassigned','245'),
('Use of art in Christianity','246'),
('Church furnishings & articles','247'),
('Christian experience, practice & life','248'),
('Christian observances in family life','249'),
('Christian orders & local church','250'),
('Preaching','251'),
('Texts of sermons','252'),
('Pastoral office & work','253'),
('Parish administration','254'),
('Religious congregations & orders','255'),
('Unassigned','256'),
('Unassigned','257'),
('Unassigned','258'),
('Pastoral care of families & kinds of persons','259'),
('Social & ecclesiastical theology','260'),
('Social theology','261'),
('Ecclesiology','262'),
('Days, times & places of observance','263'),
('Public worship','264'),
('Sacraments, other rites & acts','265'),
('Missions','266'),
('Associations for religious work','267'),
('Religious education','268'),
('Spiritual renewal','269'),
('History of Christianity & Christian church','270'),
('Religious orders in church history','271'),
('Persecutions in church history','272'),
('Doctrinal controversies & heresies','273'),
('History of Christianity in Europe','274'),
('History of Christianity in Asia','275'),
('History of Christianity in Africa','276'),
('History of Christianity in North America','277'),
('History of Christianity in South America','278'),
('History of Christianity in other areas','279'),
('Christian denominations & sects','280'),
('Early church & Eastern churches','281'),
('Roman Catholic Church','282'),
('Anglican churches','283'),
('Protestants of Continental origin','284'),
('Presbyterian, Reformed & Congregational','285'),
('Baptist, Disciples of Christ & Adventist','286'),
('Methodist & related churches','287'),
('Unassigned','288'),
('Other denominations & sects','289'),
('Other religions','290'),
('Unassigned','291'),
('Greek & Roman religion','292'),
('Germanic religion','293'),
('Religions of Indic origin','294'),
('Zoroastrianism','295'),
('Judaism','296'),
('Islam, Babism & Bahai Faith','297'),
('(Optional number)','298'),
('Religions not provided for elsewhere','299'),
('Social sciences','300'),
('Sociology & anthropology','301'),
('Social interaction','302'),
('Social processes','303'),
('Factors affecting social behavior','304'),
('Social groups','305'),
('Culture & institutions','306'),
('Communities','307'),
('Unassigned','308'),
('Unassigned','309'),
('Collections of general statistics','310'),
('Unassigned','311'),
('Unassigned','312'),
('Unassigned','313'),
('General statistics of Europe','314'),
('General statistics of Asia','315'),
('General statistics of Africa','316'),
('General statistics of North America','317'),
('General statistics of South America','318'),
('General statistics of other areas','319'),
('Political science','320'),
('Systems of governments & states','321'),
('Relation of state to organized groups','322'),
('Civil & political rights','323'),
('The political process','324'),
('International migration & colonization','325'),
('Slavery & emancipation','326'),
('International relations','327'),
('The legislative process','328'),
('Unassigned','329'),
('Economics','330'),
('Labor economics','331'),
('Financial economics','332'),
('Economics of land & energy','333'),
('Cooperatives','334'),
('Socialism & related systems','335'),
('Public finance','336'),
('International economics','337'),
('Production','338'),
('Macroeconomics & related topics','339'),
('Law','340'),
('Law of nations','341'),
('Constitutional & administrative law','342'),
('Military, tax, trade & industrial law','343'),
('Labor, social, education & cultural law','344'),
('Criminal law','345'),
('Private law','346'),
('Civil procedure & courts','347'),
('Laws, regulations & cases','348'),
('Law of specific jurisdictions & areas','349'),
('Public administration & military science','350'),
('Public administration','351'),
('General considerations of public administration','352'),
('Specific fields of public administration','353'),
('Administration of economy & environment','354'),
('Military science','355'),
('Infantry forces & warfare','356'),
('Mounted forces & warfare','357'),
('Air & other specialized forces','358'),
('Sea forces & warfare','359'),
('Social problems & services; associations','360'),
('Social problems & social welfare in general','361'),
('Social welfare problems & services','362'),
('Other social problems & services','363'),
('Criminology','364'),
('Penal & related institutions','365'),
('Associations','366'),
('General clubs','367'),
('Insurance','368'),
('Miscellaneous kinds of associations','369'),
('Education','370'),
('Schools & their activities; special education','371'),
('Elementary education','372'),
('Secondary education','373'),
('Adult education','374'),
('Curricula','375'),
('Unassigned','376'),
('Unassigned','377'),
('Higher education','378'),
('Public policy issues in education','379'),
('Commerce, communications & transportation','380'),
('Commerce','381'),
('International commerce','382'),
('Postal communication','383'),
('Communications; telecommunication','384'),
('Railroad transportation','385'),
('Inland waterway & ferry transportation','386'),
('Water, air & space transportation','387'),
('Transportation; ground transportation','388'),
('Metrology & standardization','389'),
('Customs, etiquette & folklore','390'),
('Costume & personal appearance','391'),
('Customs of life cycle & domestic life','392'),
('Death customs','393'),
('General customs','394'),
('Etiquette (Manners)','395'),
('Unassigned','396'),
('Unassigned','397'),
('Folklore','398'),
('Customs of war & diplomacy','399'),
('Language','400'),
('Philosophy & theory','401'),
('Miscellany','402'),
('Dictionaries & encyclopedias','403'),
('Special topics','404'),
('Serial publications','405'),
('Organizations & management','406'),
('Education, research & related topics','407'),
('Kinds of persons treatment','408'),
('Geographic & persons treatment','409'),
('Linguistics','410'),
('Writing systems','411'),
('Etymology','412'),
('Dictionaries','413'),
('Phonology & phonetics','414'),
('Grammar','415'),
('Unassigned','416'),
('Dialectology & historical linguistics','417'),
('Standard usage & applied linguistics','418'),
('Sign languages','419'),
('English & Old English','420'),
('English writing system & phonology','421'),
('English etymology','422'),
('English dictionaries','423'),
('Unassigned','424'),
('English grammar','425'),
('Unassigned','426'),
('English language variations','427'),
('Standard English usage','428'),
('Old English (Anglo-Saxon)','429'),
('Germanic languages; German','430'),
('German writing systems & phonology','431'),
('German etymology','432'),
('German dictionaries','433'),
('Unassigned','434'),
('German grammar','435'),
('Unassigned','436'),
('German language variations','437'),
('Standard German usage','438'),
('Other Germanic languages','439'),
('Romance languages; French','440'),
('French writing systems & phonology','441'),
('French etymology','442'),
('French dictionaries','443'),
('Unassigned','444'),
('French grammar','445'),
('Unassigned','446'),
('French language variations','447'),
('Standard French usage','448'),
('Occitan & Catalan','449'),
('Italian, Romanian & related languages','450'),
('Italian writing systems & phonology','451'),
('Italian etymology','452'),
('Italian dictionaries','453'),
('Unassigned','454'),
('Italian grammar','455'),
('Unassigned','456'),
('Italian language variations','457'),
('Standard Italian usage','458'),
('Romanian & related languages','459'),
('Spanish & Portuguese languages','460'),
('Spanish writing systems & phonology','461'),
('Spanish etymology','462'),
('Spanish dictionaries','463'),
('Unassigned','464'),
('Spanish grammar','465'),
('Unassigned','466'),
('Spanish language variations','467'),
('Standard Spanish usage','468'),
('Portuguese','469'),
('Italic languages; Latin','470'),
('Classical Latin writing & phonology','471'),
('Classical Latin etymology','472'),
('Classical Latin dictionaries','473'),
('Unassigned','474'),
('Classical Latin grammar','475'),
('Unassigned','476'),
('Old, postclassical & Vulgar Latin','477'),
('Classical Latin usage','478'),
('Other Italic languages','479'),
('Hellenic languages; classical Greek','480'),
('Classical Greek writing & phonology','481'),
('Classical Greek etymology','482'),
('Classical Greek dictionaries','483'),
('Unassigned','484'),
('Classical Greek grammar','485'),
('Unassigned','486'),
('Preclassical & postclassical Greek','487'),
('Classical Greek usage','488'),
('Other Hellenic languages','489'),
('Other languages','490'),
('East Indo-European & Celtic languages','491'),
('Afro-Asiatic languages; Semitic languages','492'),
('Non-Semitic Afro-Asiatic languages','493'),
('Altaic, Uralic, Hyperborean & Dravidian','494'),
('Languages of East & Southeast Asia','495'),
('African languages','496'),
('North American native languages','497'),
('South American native languages','498'),
('Austronesian & other languages','499'),
('Natural sciences & mathematics','500'),
('Philosophy & theory','501'),
('Miscellany','502'),
('Dictionaries & encyclopedias','503'),
('Unassigned','504'),
('Serial publications','505'),
('Organizations & management','506'),
('Education, research & related topics','507'),
('Natural history','508'),
('Historical, geographic & persons treatment','509'),
('Mathematics','510'),
('General principles of mathematics','511'),
('Algebra','512'),
('Arithmetic','513'),
('Topology','514'),
('Analysis','515'),
('Geometry','516'),
('Unassigned','517'),
('Numerical analysis','518'),
('Probabilities & applied mathematics','519'),
('Astronomy & allied sciences','520'),
('Celestial mechanics','521'),
('Techniques, equipment & materials','522'),
('Specific celestial bodies & phenomena','523'),
('Unassigned','524'),
('Earth (Astronomical geography)','525'),
('Mathematical geography','526'),
('Celestial navigation','527'),
('Ephemerides','528'),
('Chronology','529'),
('Physics','530'),
('Classical mechanics; solid mechanics','531'),
('Fluid mechanics; liquid mechanics','532'),
('Gas mechanics','533'),
('Sound & related vibrations','534'),
('Light & infrared & ultraviolet phenomena','535'),
('Heat','536'),
('Electricity & electronics','537'),
('Magnetism','538'),
('Modern physics','539'),
('Chemistry & allied sciences','540'),
('Physical chemistry','541'),
('Techniques, equipment & materials','542'),
('Analytical chemistry','543'),
('Unassigned','544'),
('Unassigned','545'),
('Inorganic chemistry','546'),
('Organic chemistry','547'),
('Crystallography','548'),
('Mineralogy','549'),
('Earth sciences','550'),
('Geology, hydrology & meteorology','551'),
('Petrology','552'),
('Economic geology','553'),
('Earth sciences of Europe','554'),
('Earth sciences of Asia','555'),
('Earth sciences of Africa','556'),
('Earth sciences of North America','557'),
('Earth sciences of South America','558'),
('Earth sciences of other areas','559'),
('Paleontology; paleozoology','560'),
('Paleobotany; fossil microorganisms','561'),
('Fossil invertebrates','562'),
('Fossil marine & seashore invertebrates','563'),
('Fossil mollusks & molluscoids','564'),
('Fossil arthropods','565'),
('Fossil chordates','566'),
('Fossil cold-blooded vertebrates; fossil fishes','567'),
('Fossil birds','568'),
('Fossil mammals','569'),
('Life sciences; biology','570'),
('Physiology & related subjects','571'),
('Biochemistry','572'),
('Specific physiological systems in animals','573'),
('Unassigned','574'),
('Specific parts of & systems in plants','575'),
('Genetics & evolution','576'),
('Ecology','577'),
('Natural history of organisms','578'),
('Microorganisms, fungi & algae','579'),
('Plants (Botany)','580'),
('Specific topics in natural history','581'),
('Plants noted for characteristics & flowers','582'),
('Dicotyledons','583'),
('Monocotyledons','584'),
('Gymnosperms; conifers','585'),
('Seedless plants','586'),
('Vascular seedless plants','587'),
('Bryophytes','588'),
('Unassigned','589'),
('Animals (Zoology)','590'),
('Specific topics in natural history','591'),
('Invertebrates','592'),
('Marine & seashore invertebrates','593'),
('Mollusks & molluscoids','594'),
('Arthropods','595'),
('Chordates','596'),
('Cold-blooded vertebrates; fishes','597'),
('Birds','598'),
('Mammals','599'),
('Technology','600'),
('Philosophy & theory','601'),
('Miscellany','602'),
('Dictionaries & encyclopedias','603'),
('Special topics','604'),
('Serial publications','605'),
('Organizations','606'),
('Education, research & related topics','607'),
('Inventions & patents','608'),
('Historical, geographic & persons treatment','609'),
('Medicine & health','610'),
('Human anatomy, cytology & histology','611'),
('Human physiology','612'),
('Personal health & safety','613'),
('Incidence & prevention of disease','614'),
('Pharmacology & therapeutics','615'),
('Diseases','616'),
('Surgery & related medical specialties','617'),
('Gynecology, obstetrics, pediatrics & geriatrics','618'),
('Unassigned','619'),
('Engineering & allied operations','620'),
('Applied physics','621'),
('Mining & related operations','622'),
('Military & nautical engineering','623'),
('Civil engineering','624'),
('Engineering of railroads & roads','625'),
('Unassigned','626'),
('Hydraulic engineering','627'),
('Sanitary & municipal engineering','628'),
('Other branches of engineering','629'),
('Agriculture & related technologies','630'),
('Techniques, equipment & materials','631'),
('Plant injuries, diseases & pests','632'),
('Field & plantation crops','633'),
('Orchards, fruits & forestry','634'),
('Garden crops (Horticulture)','635'),
('Animal husbandry','636'),
('Processing dairy & related products','637'),
('Insect culture','638'),
('Hunting, fishing & conservation','639'),
('Home & family management','640'),
('Food & drink','641'),
('Meals & table service','642'),
('Housing & household equipment','643'),
('Household utilities','644'),
('Household furnishings','645'),
('Sewing, clothing & personal living','646'),
('Management of public households','647'),
('Housekeeping','648'),
('Child rearing & home care of persons','649'),
('Management & auxiliary services','650'),
('Office services','651'),
('Processes of written communication','652'),
('Shorthand','653'),
('Unassigned','654'),
('Unassigned','655'),
('Unassigned','656'),
('Accounting','657'),
('General management','658'),
('Advertising & public relations','659'),
('Chemical engineering','660'),
('Industrial chemicals','661'),
('Explosives, fuels & related products','662'),
('Beverage technology','663'),
('Food technology','664'),
('Industrial oils, fats, waxes & gases','665'),
('Ceramic & allied technologies','666'),
('Cleaning, color & coating technologies','667'),
('Technology of other organic products','668'),
('Metallurgy','669'),
('Manufacturing','670'),
('Metalworking & primary metal products','671'),
('Iron, steel & other iron alloys','672'),
('Nonferrous metals','673'),
('Lumber processing, wood products & cork','674'),
('Leather & fur processing','675'),
('Pulp & paper technology','676'),
('Textiles','677'),
('Elastomers & elastomer products','678'),
('Other products of specific materials','679'),
('Manufacture for specific uses','680'),
('Precision instruments & other devices','681'),
('Small forge work (Blacksmithing)','682'),
('Hardware & household appliances','683'),
('Furnishings & home workshops','684'),
('Leather, fur goods & related products','685'),
('Printing & related activities','686'),
('Clothing & accessories','687'),
('Other final products & packaging','688'),
('Unassigned','689'),
('Buildings','690'),
('Building materials','691'),
('Auxiliary construction practices','692'),
('Specific materials & purposes','693'),
('Wood construction & carpentry','694'),
('Roof covering','695'),
('Utilities','696'),
('Heating, ventilating & air-conditioning','697'),
('Detail finishing','698'),
('Unassigned','699'),
('The arts; fine & decorative arts','700'),
('Philosophy of fine & decorative arts','701'),
('Miscellany of fine & decorative arts','702'),
('Dictionaries of fine & decorative arts','703'),
('Special topics in fine & decorative arts','704'),
('Serial publications of fine & decorative arts','705'),
('Organizations & management','706'),
('Education, research & related topics','707'),
('Galleries, museums & private collections','708'),
('Historical, geographic & persons treatment','709'),
('Civic & landscape art','710'),
('Area planning','711'),
('Landscape architecture','712'),
('Landscape architecture of trafficways','713'),
('Water features','714'),
('Woody plants','715'),
('Herbaceous plants','716'),
('Structures in landscape architecture','717'),
('Landscape design of cemeteries','718'),
('Natural landscapes','719'),
('Architecture','720'),
('Architectural structure','721'),
('Architecture to ca. 300','722'),
('Architecture from ca. 300 to 1399','723'),
('Architecture from 1400','724'),
('Public structures','725'),
('Buildings for religious purposes','726'),
('Buildings for education & research','727'),
('Residential & related buildings','728'),
('Design & decoration','729'),
('Plastic arts; sculpture','730'),
('Processes, forms & subjects of sculpture','731'),
('Sculpture to ca. 500','732'),
('Greek, Etruscan & Roman sculpture','733'),
('Sculpture from ca. 500 to 1399','734'),
('Sculpture from 1400','735'),
('Carving & carvings','736'),
('Numismatics & sigillography','737'),
('Ceramic arts','738'),
('Art metalwork','739'),
('Drawing & decorative arts','740'),
('Drawing & drawings','741'),
('Perspective','742'),
('Drawing & drawings by subject','743'),
('Unassigned','744'),
('Decorative arts','745'),
('Textile arts','746'),
('Interior decoration','747'),
('Glass','748'),
('Furniture & accessories','749'),
('Painting & paintings','750'),
('Techniques, equipment, materials & forms','751'),
('Color','752'),
('Symbolism, allegory, mythology & legend','753'),
('Genre paintings','754'),
('Religion','755'),
('Unassigned','756'),
('Human figures','757'),
('Other subjects','758'),
('Historical, geographic & persons treatment','759'),
('Graphic arts; printmaking & prints','760'),
('Relief processes (Block printing)','761'),
('Unassigned','762'),
('Lithographic processes','763'),
('Chromolithography & serigraphy','764'),
('Metal engraving','765'),
('Mezzotinting, aquatinting & related processes','766'),
('Etching & drypoint','767'),
('Unassigned','768'),
('Prints','769'),
('Photography, photographs & computer art','770'),
('Techniques, equipment & materials','771'),
('Metallic salt processes','772'),
('Pigment processes of printing','773'),
('Holography','774'),
('Digital photography','775'),
('Computer art (Digital art)','776'),
('Unassigned','777'),
('Fields & kinds of photography','778'),
('Photographs','779'),
('Music','780'),
('General principles & musical forms','781'),
('Vocal music','782'),
('Music for single voices; the voice','783'),
('Instruments & instrumental ensembles','784'),
('Ensembles with one instrument per part','785'),
('Keyboard & other instruments','786'),
('Stringed instruments','787'),
('Wind instruments','788'),
('(Optional number)','789'),
('Recreational & performing arts','790'),
('Public performances','791'),
('Stage presentations','792'),
('Indoor games & amusements','793'),
('Indoor games of skill','794'),
('Games of chance','795'),
('Athletic & outdoor sports & games','796'),
('Aquatic & air sports','797'),
('Equestrian sports & animal racing','798'),
('Fishing, hunting & shooting','799'),
('Literature & rhetoric','800'),
('Philosophy & theory','801'),
('Miscellany','802'),
('Dictionaries & encyclopedias','803'),
('Unassigned','804'),
('Serial publications','805'),
('Organizations & management','806'),
('Education, research & related topics','807'),
('Rhetoric & collections of literature','808'),
('History, description & criticism','809'),
('American literature in English','810'),
('American poetry in English','811'),
('American drama in English','812'),
('American fiction in English','813'),
('American essays in English','814'),
('American speeches in English','815'),
('American letters in English','816'),
('American humor & satire in English','817'),
('American miscellaneous writings','818'),
('(Optional number)','819'),
('English & Old English literatures','820'),
('English poetry','821'),
('English drama','822'),
('English fiction','823'),
('English essays','824'),
('English speeches','825'),
('English letters','826'),
('English humor & satire','827'),
('English miscellaneous writings','828'),
('Old English (Anglo-Saxon)','829'),
('Literatures of Germanic languages','830'),
('German poetry','831'),
('German drama','832'),
('German fiction','833'),
('German essays','834'),
('German speeches','835'),
('German letters','836'),
('German humor & satire','837'),
('German miscellaneous writings','838'),
('Other Germanic literatures','839'),
('Literatures of Romance languages','840'),
('French poetry','841'),
('French drama','842'),
('French fiction','843'),
('French essays','844'),
('French speeches','845'),
('French letters','846'),
('French humor & satire','847'),
('French miscellaneous writings','848'),
('Occitan & Catalan literatures','849'),
('Italian, Romanian & related literatures','850'),
('Italian poetry','851'),
('Italian drama','852'),
('Italian fiction','853'),
('Italian essays','854'),
('Italian speeches','855'),
('Italian letters','856'),
('Italian humor & satire','857'),
('Italian miscellaneous writings','858'),
('Romanian & related literatures','859'),
('Spanish & Portuguese literatures','860'),
('Spanish poetry','861'),
('Spanish drama','862'),
('Spanish fiction','863'),
('Spanish essays','864'),
('Spanish speeches','865'),
('Spanish letters','866'),
('Spanish humor & satire','867'),
('Spanish miscellaneous writings','868'),
('Portuguese literature','869'),
('Italic literatures; Latin literature','870'),
('Latin poetry','871'),
('Latin dramatic poetry & drama','872'),
('Latin epic poetry & fiction','873'),
('Latin lyric poetry','874'),
('Latin speeches','875'),
('Latin letters','876'),
('Latin humor & satire','877'),
('Latin miscellaneous writings','878'),
('Literatures of other Italic languages','879'),
('Hellenic literatures; classical Greek','880'),
('Classical Greek poetry','881'),
('Classical Greek dramatic poetry & drama','882'),
('Classical Greek epic poetry & fiction','883'),
('Classical Greek lyric poetry','884'),
('Classical Greek speeches','885'),
('Classical Greek letters','886'),
('Classical Greek humor & satire','887'),
('Classical Greek miscellaneous writings','888'),
('Modern Greek literature','889'),
('Literatures of other languages','890'),
('East Indo-European & Celtic literatures','891'),
('Afro-Asiatic literatures; Semitic literatures','892'),
('Non-Semitic Afro-Asiatic literatures','893'),
('Altaic, Uralic, Hyperborean & Dravidian','894'),
('Literatures of East & Southeast Asia','895'),
('African literatures','896'),
('North American native literatures','897'),
('South American native literatures','898'),
('Austronesian & other literatures','899'),
('History & geography','900'),
('Philosophy & theory','901'),
('Miscellany','902'),
('Dictionaries & encyclopedias','903'),
('Collected accounts of events','904'),
('Serial publications','905'),
('Organizations & management','906'),
('Education, research & related topics','907'),
('Kinds of persons treatment','908'),
('World history','909'),
('Geography & travel','910'),
('Historical geography','911'),
('Atlases, maps, charts & plans','912'),
('Geography of & travel in ancient world','913'),
('Geography of & travel in Europe','914'),
('Geography of & travel in Asia','915'),
('Geography of & travel in Africa','916'),
('Geography of & travel in North America','917'),
('Geography of & travel in South America','918'),
('Geography of & travel in other areas','919'),
('Biography, genealogy & insignia','920'),
('(Optional number)','921'),
('(Optional number)','922'),
('(Optional number)','923'),
('(Optional number)','924'),
('(Optional number)','925'),
('(Optional number)','926'),
('(Optional number)','927'),
('(Optional number)','928'),
('Genealogy, names & insignia','929'),
('History of ancient world to ca. 499','930'),
('China to 420','931'),
('Egypt to 640','932'),
('Palestine to 70','933'),
('India to 647','934'),
('Mesopotamia & Iranian Plateau to 637','935'),
('Europe north & west of Italy to ca. 499','936'),
('Italy & adjacent territories to 476','937'),
('Greece to 323','938'),
('Other parts of ancient world to ca. 640','939'),
('History of Europe','940'),
('British Isles','941'),
('England & Wales','942'),
('Central Europe; Germany','943'),
('France & Monaco','944'),
('Italian Peninsula & adjacent islands','945'),
('Iberian Peninsula & adjacent islands','946'),
('Eastern Europe; Russia','947'),
('Scandinavia','948'),
('Other parts of Europe','949'),
('History of Asia; Far East','950'),
('China & adjacent areas','951'),
('Japan','952'),
('Arabian Peninsula & adjacent areas','953'),
('South Asia; India','954'),
('Iran','955'),
('Middle East (Near East)','956'),
('Siberia (Asiatic Russia)','957'),
('Central Asia','958'),
('Southeast Asia','959'),
('History of Africa','960'),
('Tunisia & Libya','961'),
('Egypt & Sudan','962'),
('Ethiopia & Eritrea','963'),
('Northwest African coast & offshore islands','964'),
('Algeria','965'),
('West Africa & offshore islands','966'),
('Central Africa & offshore islands','967'),
('Southern Africa; Republic of South Africa','968'),
('South Indian Ocean islands','969'),
('History of North America','970'),
('Canada','971'),
('Middle America; Mexico','972'),
('United States','973'),
('Northeastern United States','974'),
('Southeastern United States','975'),
('South central United States','976'),
('North central United States','977'),
('Western United States','978'),
('Great Basin & Pacific Slope region','979'),
('History of South America','980'),
('Brazil','981'),
('Argentina','982'),
('Chile','983'),
('Bolivia','984'),
('Peru','985'),
('Colombia & Ecuador','986'),
('Venezuela','987'),
('Guiana','988'),
('Paraguay & Uruguay','989'),
('History of other areas','990'),
('Unassigned','991'),
('Unassigned','992'),
('New Zealand','993'),
('Australia','994'),
('Melanesia; New Guinea','995'),
('Other parts of Pacific; Polynesia','996'),
('Atlantic Ocean islands','997'),
('Arctic islands & Antarctica','998'),
('Extraterrestrial worlds','999');
