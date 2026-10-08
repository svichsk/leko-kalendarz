import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// --- NOWE IMPORTY FIREBASE ---
import { signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // <--- NOWE
import { auth, googleProvider, db } from "./firebase";    // <--- DODANO db


const localDrugsDb = [
  { id: 1, name: "Paracetamol", substance: "Paracetamolum", producer: "Różni producenci", doses: [500, 1000], unit: "mg", description: "Lek o działaniu przeciwbólowym i przeciwgorączkowym. Nie wykazuje działania przeciwzapalnego. Bezpieczny dla żołądka." },
  { id: 2, name: "Ibuprofen", substance: "Ibuprofenum", producer: "Różni producenci", doses: [200, 400, 600], unit: "mg", description: "Niesteroidowy lek przeciwzapalny (NLPZ). Działa przeciwzapalnie, przeciwbólowo i przeciwgorączkowo." },
  { id: 3, name: "Ketoprofen", substance: "Ketoprofenum", producer: "Sandoz", doses: [50, 100], unit: "mg", description: "Silny lek z grupy NLPZ. Stosowany w bólach pourazowych, reumatycznych i bólach mięśni." },
  { id: 4, name: "Diklofenak", substance: "Diclofenacum", producer: "GSK", doses: [25, 50, 75, 100], unit: "mg", description: "Lek przeciwzapalny i przeciwbólowy, często stosowany w bólach stawów, chorobach reumatoidalnych." },
  { id: 5, name: "Naproksen", substance: "Naproxenum", producer: "Hasco-Lek", doses: [220, 250, 500], unit: "mg", description: "Długodziałający lek przeciwbólowy i przeciwzapalny. Polecany w bólach menstruacyjnych oraz bólach stawów." },
  { id: 6, name: "Meloksykam", substance: "Meloxicamum", producer: "Teva", doses: [7.5, 15], unit: "mg", description: "Lek przeciwzapalny nowszej generacji. Stosowany głównie w reumatoidalnym zapaleniu stawów." },
  { id: 7, name: "Tramadol", substance: "Tramadoli hydrochloridum", producer: "Polpharma", doses: [50, 100, 150, 200], unit: "mg", description: "Silny, opioidowy lek przeciwbólowy o działaniu ośrodkowym. Stosowany w bólach o nasileniu umiarkowanym do dużego." },
  { id: 8, name: "Morfina", substance: "Morphinum", producer: "WZF Polfa", description: "Bardzo silny lek opioidowy stosowany w bólach nowotworowych, pooperacyjnych i zawałowych." },
  { id: 9, name: "Kodeina", substance: "Codeinum", producer: "GlaxoSmithKline", description: "Słaby opioid o działaniu przeciwbólowym oraz silnym działaniu przeciwkaszlowym." },
  { id: 10, name: "Buprenorfina", substance: "Buprenorphinum", producer: "Zentiva", description: "Silny opioid stosowany w leczeniu silnego bólu oraz w terapii zastępczej uzależnień od opiatów." },
  { id: 11, name: "Amoksycylina", substance: "Amoxicillinum", producer: "Polpharma", doses: [500, 1000], unit: "mg", description: "Antybiotyk z grupy penicylin. Szerokie spektrum działania, często stosowany w zapaleniach dróg oddechowych." },
  { id: 12, name: "Azytromycyna", substance: "Azithromycinum", producer: "Teva", doses: [250, 500], unit: "mg", description: "Antybiotyk makrolidowy. Kumuluje się w tkankach, co pozwala na krótkie, zazwyczaj 3-dniowe kuracje." },
  { id: 13, name: "Cyprofloksacyna", substance: "Ciprofloxacinum", producer: "Bayer", doses: [250, 500], unit: "mg", description: "Chemioterapeutyk z grupy fluorochinolonów. Skuteczny głównie w zakażeniach dróg moczowych." },
  { id: 14, name: "Doksycyklina", substance: "Doxycyclinum", producer: "Polfa Tarchomin", doses: [100], unit: "mg", description: "Antybiotyk tetracyklinowy. Stosowany w leczeniu boreliozy, zakażeń atypowych i trądziku." },
  { id: 15, name: "Cefuroksym", substance: "Cefuroximum", producer: "Sandoz", doses: [250, 500], unit: "mg", description: "Antybiotyk cefalosporynowy II generacji. Wykorzystywany w infekcjach dróg oddechowych, moczowych i zakażeniach skóry." },
  { id: 16, name: "Klarytromycyna", substance: "Clarithromycinum", producer: "Abbott", doses: [250, 500], unit: "mg", description: "Makrolid stosowany jako alternatywa dla penicylin. Skuteczny m.in. w leczeniu wrzodów żołądka." },
  { id: 17, name: "Metronidazol", substance: "Metronidazolum", producer: "Polpharma", doses: [250, 500], unit: "mg", description: "Lek przeciwbakteryjny i przeciwpierwotniakowy. Bezwzględnie zabrania się łączenia go z alkoholem." },
  { id: 18, name: "Klindamycyna", substance: "Clindamycinum", producer: "MIP Pharma", doses: [300, 600], unit: "mg", description: "Antybiotyk linkozamidowy. Skuteczny w zakażeniach kości, stawów i zębów." },
  { id: 19, name: "Ceftriakson", substance: "Ceftriaxonum", producer: "Sandoz", description: "Antybiotyk cefalosporynowy III generacji. Podawany w iniekcjach, skuteczny w bardzo ciężkich zakażeniach szpitalnych." },
  { id: 20, name: "Lewofloksacyna", substance: "Levofloxacinum", producer: "Sanofi", doses: [250, 500], unit: "mg", description: "Silny fluorochinolon stosowany w zapaleniach płuc i powikłanych zakażeniach dróg moczowych." },
  { id: 21, name: "Bisoprolol", substance: "Bisoprololum", producer: "Merck", doses: [2.5, 5, 10], unit: "mg", description: "Kardioselektywny beta-bloker. Zwalnia rytm serca i obniża ciśnienie tętnicze." },
  { id: 22, name: "Metoprolol", substance: "Metoprololum", producer: "AstraZeneca", doses: [25, 50, 100], unit: "mg", description: "Beta-bloker. Zapobiega bólom dławicowym, obniża ciśnienie i reguluje rytm serca po zawale." },
  { id: 23, name: "Nebiwolol", substance: "Nebivololum", producer: "Berlin-Chemie", doses: [5], unit: "mg", description: "Nowoczes beta-bloker, który dodatkowo rozszerza naczynia krwionośne." },
  { id: 24, name: "Amlodypina", substance: "Amlodipinum", producer: "Pfizer", doses: [5, 10], unit: "mg", description: "Bloker kanału wapniowego. Rozkurcza naczynia krwionośne, skutecznie obniżając ciśnienie." },
  { id: 25, name: "Ramipryl", substance: "Ramiprilum", producer: "Sanofi", doses: [2.5, 5, 10], unit: "mg", description: "Lek z grupy inhibitorów ACE. Podstawowy lek w nadciśnieniu i niewydolności serca." },
  { id: 26, name: "Peryndopryl", substance: "Perindoprilum", producer: "Servier", doses: [4, 5, 8, 10], unit: "mg", description: "Inhibitor konwertazy angiotensyny (ACEI). Chroni naczynia krwionośne, zapobiega powikłaniom sercowo-naczyniowym." },
  { id: 27, name: "Losartan", substance: "Losartanum", producer: "Krka", doses: [50, 100], unit: "mg", description: "Sartan (bloker receptora angiotensyny). Obniża ciśnienie." },
  { id: 28, name: "Walsartan", substance: "Valsartanum", producer: "Novartis", doses: [80, 160], unit: "mg", description: "Lek hipotensyjny z grupy sartanów. Chroni serce i nerki u pacjentów z nadciśnieniem i cukrzycą." },
  { id: 29, name: "Atorwastatyna", substance: "Atorvastatinum", producer: "Pfizer", doses: [10, 20, 40, 80], unit: "mg", description: "Silna statyna obniżająca poziom cholesterolu (LDL) i trójglicerydów." },
  { id: 30, name: "Rozuwastatyna", substance: "Rosuvastatinum", producer: "AstraZeneca", doses: [5, 10, 20, 40], unit: "mg", description: "Najsilniejsza dostępna statyna. Bardzo skutecznie obniża poziom lipidów we krwi." },
  { id: 31, name: "Symwastatyna", substance: "Simvastatinum", producer: "Teva", doses: [20, 40], unit: "mg", description: "Starsza, ale sprawdzona statyna obniżająca poziom cholesterolu. Należy przyjmować ją wieczorem." },
  { id: 32, name: "Furosemid", substance: "Furosemidum", producer: "Polpharma", doses: [40], unit: "mg", description: "Silny lek moczopędny (diuretyk pętlowy). Gwałtownie odwadnia." },
  { id: 33, name: "Torasemid", substance: "Torasemidum", producer: "Sandoz", doses: [5, 10], unit: "mg", description: "Nowocześniejszy odpowiednik furosemidu. Działa dłużej i równomierniej." },
  { id: 34, name: "Spironolakton", substance: "Spironolactonum", producer: "Gedeon Richter", doses: [25, 50, 100], unit: "mg", description: "Lek moczopędny oszczędzający potas. Stosowany w niewydolności serca i marskości wątroby." },
  { id: 35, name: "Indapamid", substance: "Indapamidum", producer: "Servier", doses: [1.5, 2.5], unit: "mg", description: "Łagodny diuretyk stosowany głównie w leczeniu nadciśnienia tętniczego." },
  { id: 36, name: "Omeprazol", substance: "Omeprazolum", producer: "Polpharma", doses: [20, 40], unit: "mg", description: "Inhibitor pompy protonowej (IPP). Hamuje wydzielanie kwasu solnego w żołądku." },
  { id: 37, name: "Pantoprazol", substance: "Pantoprazolum", producer: "Takeda", doses: [20, 40], unit: "mg", description: "Bezpieczny i skuteczny IPP. Wchodzi w mniej interakcji z innymi lekami niż omeprazol." },
  { id: 38, name: "Lanzoprazol", substance: "Lansoprazolum", producer: "Krka", doses: [15, 30], unit: "mg", description: "Szybko działający lek zmniejszający wydzielanie kwasu żołądkowego." },
  { id: 39, name: "Famotydyna", substance: "Famotidinum", producer: "Polfa", description: "Bloker receptora H2. Hamuje wydzielanie kwasu żołądkowego." },
  { id: 40, name: "Loperamid", substance: "Loperamidum", producer: "Janssen", doses: [2], unit: "mg", description: "Szybki i skuteczny lek hamujący perystaltykę jelit, stosowany w leczeniu objawów nagłej biegunki." },
  { id: 41, name: "Metformina", substance: "Metforminum", producer: "Merck", doses: [500, 850, 1000], unit: "mg", description: "Lek pierwszego wyboru w cukrzycy typu 2. Zmniejsza insulinooporność, pomaga w kontroli masy ciała." },
  { id: 42, name: "Glimepiryd", substance: "Glimepiridum", producer: "Sanofi", doses: [1, 2, 3, 4], unit: "mg", description: "Pochodna sulfonylomocznika. Zmusza trzustkę do zwiększonej produkcji insuliny." },
  { id: 43, name: "Gliklazyd", substance: "Gliclazidum", producer: "Servier", doses: [30, 60], unit: "mg", description: "Lek uwalniający insulinę z trzustki w cukrzycy typu 2." },
  { id: 44, name: "Empagliflozyna", substance: "Empagliflozinum", producer: "Boehringer Ingelheim", doses: [10, 25], unit: "mg", description: "Flozyna. Powoduje wydalanie nadmiaru glukozy z moczem. Dodatkowo chroni serce i nerki." },
  { id: 45, name: "Dapagliflozyna", substance: "Dapagliflozinum", producer: "AstraZeneca", doses: [10], unit: "mg", description: "Nowoczesny lek przeciwcukrzycowy. Obniża poziom cukru we krwi poprzez zwiększenie jego wydalania przez nerki." },
  { id: 46, name: "Semaglutyd", substance: "Semaglutidum", producer: "Novo Nordisk", doses: [0.25, 0.5, 1], unit: "mg", description: "Analog GLP-1. Silnie obniża poziom cukru i znacząco hamuje apetyt, co prowadzi do spadku masy ciała." },
  { id: 47, name: "Insulina Glargine", substance: "Insulinum glargine", producer: "Sanofi", description: "Insulina długodziałająca (bazowa). Zapewnia stały poziom insuliny w tle przez około 24 godziny." },
  { id: 48, name: "Insulina Lispro", substance: "Insulinum lispro", producer: "Eli Lilly", description: "Insulina szybkodziałająca. Podawana tuż przed posiłkiem." },
  { id: 49, name: "Euthyrox N", substance: "Levothyroxinum natricum", producer: "Merck", doses: [25, 50, 75, 88, 100, 112, 125, 150], unit: "µg", description: "Syntetyczny hormon tarczycy. Podstawowy lek w niedoczynności tarczycy i chorobie Hashimoto." },
  { id: 50, name: "Tiamazol", substance: "Thiamazolum", producer: "Hasco-Lek", description: "Lek przeciwtarczycowy. Hamuje produkcję hormonów tarczycy, stosowany w jej nadczynności." },
  { id: 51, name: "Sertralina", substance: "Sertralinum", producer: "Pfizer", doses: [50, 100], unit: "mg", description: "Lek antydepresyjny z grupy SSRI. Reguluje poziom serotoniny, skuteczny w depresji i zaburzeniach lękowych." },
  { id: 52, name: "Escitalopram", substance: "Escitalopramum", producer: "Lundbeck", doses: [10, 20], unit: "mg", description: "Jeden z najnowocześniejszych leków z grupy SSRI. Dobrze tolerowany w leczeniu depresji." },
  { id: 53, name: "Fluoksetyna", substance: "Fluoxetinum", producer: "Eli Lilly", doses: [20], unit: "mg", description: "Klasyczny antydepresant SSRI. Dodaje energii, łagodzi lęki." },
  { id: 54, name: "Wenlafaksyna", substance: "Venlafaxinum", producer: "Pfizer", doses: [37.5, 75, 150], unit: "mg", description: "Lek z grupy SNRI. Bardzo skuteczny w cięższych, lekoopornych depresjach." },
  { id: 55, name: "Duloksetyna", substance: "Duloxetinum", producer: "Eli Lilly", doses: [30, 60], unit: "mg", description: "Antydepresant SNRI. Poza leczeniem nastroju, bardzo skutecznie redukuje ból neuropatyczny." },
  { id: 56, name: "Mirtazapina", substance: "Mirtazapinum", producer: "Organon", doses: [15, 30], unit: "mg", description: "Lek przeciwdepresyjny o silnym działaniu nasennym i poprawiającym apetyt." },
  { id: 57, name: "Trazodon", substance: "Trazodonum", producer: "Angelini", doses: [75, 150], unit: "mg", description: "Lek antydepresyjny używany w małych dawkach głównie do poprawy jakości snu." },
  { id: 58, name: "Alprazolam", substance: "Alprazolamum", producer: "Pfizer", doses: [0.25, 0.5, 1], unit: "mg", description: "Silny lek przeciwlękowy i uspokajający (benzodiazepina)." },
  { id: 59, name: "Diazepam", substance: "Diazepamum", producer: "Polfa", doses: [2, 5], unit: "mg", description: "Długodziałający lek uspokajający, przeciwdrgawkowy i zwiotczający mięśnie." },
  { id: 60, name: "Klonazepam", substance: "Clonazepamum", producer: "Polfa", doses: [0.5, 2], unit: "mg", description: "Silna benzodiazepina o działaniu przeciwpadaczkowym i uspokajającym." },
  { id: 61, name: "Zolpidem", substance: "Zolpidemum", producer: "Sanofi", doses: [10], unit: "mg", description: "Szybki, krótkodziałający lek nasenny." },
  { id: 62, name: "Pregabalina", substance: "Pregabalinum", producer: "Pfizer", doses: [75, 150, 300], unit: "mg", description: "Początkowo lek przeciwpadaczkowy, obecnie standard w leczeniu bólów neuropatycznych i stanów lękowych." },
  { id: 63, name: "Gabapentyna", substance: "Gabapentinum", producer: "Pfizer", doses: [300, 400], unit: "mg", description: "Lek na padaczkę i ból neuropatyczny." },
  { id: 64, name: "Karbamazepina", substance: "Carbamazepinum", producer: "Novartis", doses: [200, 400], unit: "mg", description: "Stabilizator nastroju i lek przeciwpadaczkowy." },
  { id: 65, name: "Kwas walproinowy", substance: "Acidum valproicum", producer: "Sanofi", description: "Lek przeciwpadaczkowy i stabilizator nastroju." },
  { id: 66, name: "Lamotrygina", substance: "Lamotriginum", producer: "GSK", doses: [25, 50, 100], unit: "mg", description: "Bezpieczny lek przeciwpadaczkowy i stabilizujący nastrój." },
  { id: 67, name: "Haloperidol", substance: "Haloperidolum", producer: "Janssen", description: "Klasyczny silny lek neuroleptyczny stosowany w ostrej schizofrenii." },
  { id: 68, name: "Kwetiapina", substance: "Quetiapinum", producer: "AstraZeneca", doses: [25, 100, 200], unit: "mg", description: "Atypowy neuroleptyk. W małych dawkach działa uspokajająco i nasennie." },
  { id: 69, name: "Olanzapina", substance: "Olanzapinum", producer: "Eli Lilly", doses: [5, 10], unit: "mg", description: "Skuteczny lek przeciwpsychotyczny." },
  { id: 70, name: "Arypiprazol", substance: "Aripiprazolum", producer: "Otsuka", description: "Nowoczesny lek na schizofrenię i chorobę dwubiegunową." },
  { id: 71, name: "Cetyryzyna", substance: "Cetirizinum", producer: "UCB", doses: [10], unit: "mg", description: "Lek przeciwhistaminowy stosowany w alergii." },
  { id: 72, name: "Loratadyna", substance: "Loratadinum", producer: "Bayer", doses: [10], unit: "mg", description: "Lek na alergię II generacji. Skutecznie hamuje katar sienny." },
  { id: 73, name: "Feksofenadyna", substance: "Fexofenadinum", producer: "Sanofi", doses: [120, 180], unit: "mg", description: "Bardzo bezpieczny lek przeciwalergiczny. Nie powoduje senności." },
  { id: 74, name: "Desloratadyna", substance: "Desloratadinum", producer: "Organon", doses: [5], unit: "mg", description: "Nowoczesny lek antyalergiczny. Bezpieczny i długodziałający." },
  { id: 75, name: "Hydroksyzyna", substance: "Hydroxyzinum", producer: "UCB", doses: [10, 25], unit: "mg", description: "Lek przeciwhistaminowy o bardzo silnym działaniu uspokajającym i przeciwświądowym." },
  { id: 76, name: "Salbutamol", substance: "Salbutamolum", producer: "GSK", description: "Szybki wziewny lek rozszerzający oskrzela. Przynosi natychmiastową ulgę w dusznościach." },
  { id: 77, name: "Formoterol", substance: "Formoterolum", producer: "AstraZeneca", description: "Długodziałający lek wziewny (LABA). Rozszerza oskrzela na 12 godzin." },
  { id: 78, name: "Budezonid", substance: "Budesonidum", producer: "AstraZeneca", description: "Wziewny steryd stosowany profilaktycznie w astmie." },
  { id: 79, name: "Flutykazon", substance: "Fluticasonum", producer: "GSK", description: "Silny steryd miejscowy, stosowany wziewnie w astmie lub do nosa na oporne alergie." },
  { id: 80, name: "Montelukast", substance: "Montelukastum", producer: "Merck", doses: [10], unit: "mg", description: "Lek doustny na astmę. Zmniejsza stan zapalny i obrzęk dróg oddechowych." },
  { id: 81, name: "Warfaryna", substance: "Warfarinum", producer: "Orion", description: "Lek przeciwzakrzepowy. Wymaga regularnego pomiaru INR." },
  { id: 82, name: "Acenokumarol", substance: "Acenocoumarolum", producer: "Novartis", description: "Starszy lek przeciwzakrzepowy, działa krócej niż warfaryna." },
  { id: 83, name: "Rywaroksaban", substance: "Rivaroxabanum", producer: "Bayer", doses: [10, 15, 20], unit: "mg", description: "Nowoczesny, bezpieczny lek rozrzedzający krew (NOAC)." },
  { id: 84, name: "Apiksaban", substance: "Apixabanum", producer: "Pfizer", doses: [2.5, 5], unit: "mg", description: "Lek przeciwzakrzepowy nowej generacji. Posiada profil największego bezpieczeństwa pod kątem krwawień żołądkowych." },
  { id: 85, name: "Klopidogrel", substance: "Clopidogrelum", producer: "Sanofi", doses: [75], unit: "mg", description: "Lek przeciwpłytkowy stosowany w zapobieganiu zakrzepom u pacjentów po stencie i zawale serca." },
  { id: 86, name: "Acard", substance: "Acidum acetylsalicylicum", producer: "Polfa", doses: [75, 150], unit: "mg", description: "Niska dawka kwasu używana kardiologicznie do hamowania zlepiania się płytek krwi." },
  { id: 87, name: "Heparyna", substance: "Heparinum", producer: "WZF Polfa", description: "Lek przeciwzakrzepowy do podawania podskórnego." },
  { id: 88, name: "Enoksaparyna", substance: "Enoxaparinum", producer: "Sanofi", description: "Heparyna drobnocząsteczkowa stosowana w zastrzykach podskórnych zapobiegająco przed zakrzepicą." },
  { id: 89, name: "Sildenafil", substance: "Sildenafilum", producer: "Pfizer", doses: [25, 50, 100], unit: "mg", description: "Silnie rozszerza naczynia krwionośne prącia ułatwiając erekcję. Nie łączyć z nitratami!" },
  { id: 90, name: "Tadalafil", substance: "Tadalafilum", producer: "Eli Lilly", doses: [5, 10, 20], unit: "mg", description: "Lek na potencję o bardzo długim czasie działania." },
  { id: 91, name: "Tamsulozyna", substance: "Tamsulosinum", producer: "Astellas", doses: [0.4], unit: "mg", description: "Rozluźnia mięśnie prostaty i pęcherza." },
  { id: 92, name: "Finasteryd", substance: "Finasteridum", producer: "Organon", doses: [1, 5], unit: "mg", description: "Lek zmniejszający masę przerośniętej prostaty." },
  { id: 93, name: "Doksazosyna", substance: "Doxazosinum", producer: "Pfizer", doses: [2, 4], unit: "mg", description: "Stosowany przy przeroście prostaty i nadciśnieniu." },
  { id: 94, name: "Allopurynol", substance: "Allopurinolum", producer: "GSK", doses: [100, 300], unit: "mg", description: "Zmniejsza produkcję kwasu moczowego w organizmie. Podstawowy lek zapobiegający nawrotom ataków dny moczanowej." },
  { id: 95, name: "Febuksostat", substance: "Febuxostatum", producer: "Menarini", doses: [80, 120], unit: "mg", description: "Nowsza alternatywa dla allopurynolu na dnę moczanową." },
  { id: 96, name: "Metotreksat", substance: "Methotrexatum", producer: "Ebewe", description: "Silny lek immunosupresyjny stosowany m.in. w RZS." },
  { id: 97, name: "Kwas foliowy", substance: "Acidum folicum", producer: "Polfa", doses: [5, 15], unit: "mg", description: "Kluczowa w ciąży do rozwoju cewy nerwowej u płodu oraz podczas kuracji metotreksatem." },
  { id: 98, name: "Karbimazol", substance: "Carbimazolum", producer: "Amdipharm", description: "Lek stosowany w nadczynności tarczycy." },
  { id: 99, name: "Doksepina", substance: "Doxepinum", producer: "Teva", doses: [10, 25], unit: "mg", description: "Klasyczny, starszy lek antydepresyjny (TLPD)." },
  { id: 100, name: "Amiodaron", substance: "Amiodaronum", producer: "Sanofi", doses: [200], unit: "mg", description: "Jeden z najskuteczniejszych leków antyarytmicznych." },
  { id: 101, name: "Thiocodin", substance: "Codeini phosphas, Sulfogaiacolum", producer: "Unia", doses: [15], unit: "mg", description: "Lek przeciwkaszlowy z kodeiną. Hamuje odruch kaszlu. Posiada potencjał uzależniający." },
  { id: 102, name: "Solpadeine", substance: "Paracetamolum, Codeinum, Coffeinum", producer: "Perrigo", doses: [500], unit: "mg", description: "Lek przeciwbólowy z kodeiną i kofeiną. Stosowany w leczeniu krótkotrwałego, ostrego bólu. Ostrożnie przy regularnym stosowaniu." },
  { id: 103, name: "Octeangin", substance: "Octenidini dihydrochloridum", producer: "Klosterfrau", doses: [2.6], unit: "mg", description: "Pastylki twarde. Antyseptyk stosowany w zakażeniach śluzówki jamy ustnej i gardła." },
  { id: 104, name: "Rutinoscorbin", substance: "Rutosidum, Acidum ascorbicum", producer: "GSK", doses: [25, 100], unit: "mg", description: "Lek złożony. Wzmacnia naczynia krwionośne, zmniejsza ich przepuszczalność, wspiera odporność organizmu." },
  { id: 105, name: "Gripex", substance: "Paracetamolum, Pseudoephedrinum, Dextromethorphanum", producer: "US Pharmacia", doses: [325], unit: "mg", description: "Lek na przeziębienie i grypę. Działa przeciwbólowo, udrażnia nos i hamuje kaszel." },
  { id: 106, name: "Theraflu Extra Grip", substance: "Paracetamolum, Phenylephrinum, Pheniraminum", producer: "GSK", doses: [650], unit: "mg", description: "Proszek do rozpuszczania. Szybko łagodzi objawy przeziębienia i grypy, udrażnia nos i zatoki." },
  { id: 107, name: "Fervex", substance: "Paracetamolum, Acidum ascorbicum, Pheniraminum", producer: "UPSA", doses: [500], unit: "mg", description: "Proszek przeciwbólowy i przeciwgorączkowy, łagodzący wodnisty katar i objawy grypopodobne." },
  { id: 108, name: "Aspirin", substance: "Acidum acetylsalicylicum", producer: "Bayer", doses: [500], unit: "mg", description: "Klasyczny kwas acetylosalicylowy. Działa przeciwbólowo, przeciwgorączkowo i przeciwzapalnie." },
  { id: 109, name: "Nospa Max", substance: "Drotaverini hydrochloridum", producer: "Sanofi", doses: [80], unit: "mg", description: "Silniejsza wersja popularnego leku rozkurczowego, stosowana w bólach menstruacyjnych i kolkach." },
  { id: 110, name: "Smecta", substance: "Diosmectitum", producer: "Ipsen", description: "Proszek na biegunki. Powleka błonę śluzową przewodu pokarmowego, chroniąc przed toksynami i patogenami." },
  { id: 111, name: "Nifuroksazyd", substance: "Nifuroxazidum", producer: "Gedeon Richter", doses: [100, 200], unit: "mg", description: "Lek przeciwbakteryjny stosowany w ostrych, zakaźnych biegunkach. Nie wchłania się z przewodu pokarmowego." }
]

const extraDrugsData = [
  "Nimesil", "Skudexa", "Doreta", "Polocard", "Prestarium", "Nebilet", "Concor", "Betaloc", "Captopril", "Enalapril",
  "Amlopin", "Amlozek", "Normodipine", "Tenox", "Apo-Amlo", "Agen", "Aldactone", "Spironol", "Verospiron", "Finlepsin",
  "Neurotop", "Tegretol", "Amoksiklav", "Augmentin", "Taromentin", "Forcid", "Ramoclav", "Zinnat", "Bioracef", "Zamur",
  "Tarfazolin", "Biofuroksym", "Cefox", "Cefuroximum", "Emanera", "Nolpaza", "Controloc", "Dexilant", "Zulbex", "Mesopral",
  "Polprazol", "Bioprazol", "Ortanol", "Gasec", "Helicid", "Ultop", "Prazol", "Zolpic", "Nasen", "Onirex",
  "Polsen", "Apo-Zolpin", "Stilnox", "Xanax", "Afobam", "Zomiren", "Neurol", "Alprox", "Relanium", "Neorelium",
  "Relsed", "Estazolam", "Signopam", "Lorafen", "Cloranxen", "Tranxene", "Zoloft", "Asertin", "Setaloft", "Stimuloton",
  "Miraval", "Apo-Serta", "Zotral", "Depralin", "Escitil", "Mozarin", "Aciprex", "Elicea", "Nexpram", "Symescital",
  "Seronil", "Bioxetin", "Andepin", "Salipax", "Efectin", "Alventa", "Velaxin", "Venlectine", "Oriven", "Faxolet",
  "Cymbalta", "Dulsevia", "Depratal", "Duloxetin", "Remirta", "Mirzaten", "Mirtor", "Trittico", "Ketrel", "Kwetaplex",
  "Pinexet", "Ketiap", "Apo-Quetiapin", "Zolafren", "Olzapin", "Ranofren", "Anzapin", "Abilify", "Aribit", "Apiprazol",
  "Aryzalera", "Clatra", "Rupafin", "Jovesto", "Xyzal", "Zafiron", "Zyrtec", "Allertec", "Hitaxa", "Telfexo",
  "Allegra", "Aerius", "Dasselta", "Symla", "Atarax", "Ventolin", "Serevent", "Symbicort", "Berodual", "Milurit",
  "Xigduo", "Jardiance", "Forxiga", "Trulicity", "Ozempic", "Rybelsus", "Glucophage", "Siofor", "Formetic", "Avamina",
  "Metformax", "Glucotrol", "Diaprel", "Gliclada", "Sugen", "Amaryl", "Glibetic", "Sodanton", "Insulatard", "Actrapid",
  "NovoRapid", "Lantus", "Toujeo", "Abasaglar", "Humalog", "Apidra", "Ryzodeg", "Tresiba", "Levemir", "Letrox",
  "Novothyral", "Thyrozol", "Lipanthyl", "Suvardio", "Zahron", "Romazic", "Roswera", "Crestor", "Vasilip", "Simvacard",
  "Zocor", "Polfilin", "Agapurin", "Trental", "Cavinton", "Vicebrol", "Lucetam", "Nootropil", "Memotropil", "Biomentin",
  "Axura", "Yasmin", "Microgynon", "Marvelon", "Cilest", "Diane-35", "Jeanine", "Novynette", "Regulon", "Sylvie",
  "Vines", "Orlifique", "Atywia", "Belara", "Madinette", "NuvaRing", "Evra", "Depo-Provera", "Mirena", "Jaydess",
  "Duphaston", "Luteina", "Euthyrox", "Vigantol", "Devikap", "Sorbifer", "Tardyferon", "Magne B6", "Asmag", "Chela-Mag",
  "Aspargin", "Kalipoz", "Kaldyum", "Zolmiles", "Cinie", "Sumamigren", "Imigran", "Maxalt", "Relpax", "Migea",
  "Divascan", "Flunarizinum", "Cinnarizinum", "Captopril", "Polpril", "Tritace", "Axtil", "Vivace", "Ampril", "Piramil",
  "Lorista", "Xartan", "Lakea", "Cozaar", "Valsacor", "Diovan", "Avasart", "Micardis", "Pritor", "Kinzal",
  "Diuresin", "Tertensif", "Indapen", "Rawel", "Hyzaar", "Co-Prestarium", "Noliprel", "Tarka", "Ginkofar", "Bilobil"
]

const generateNFZ = () => {
  const arr = []
  let idCounter = 112
  for (let i = 0; i < extraDrugsData.length; i++) {
    if (idCounter > 347) break;
    arr.push({
      id: idCounter,
      name: extraDrugsData[i],
      substance: "Substancja lecznicza",
      producer: "Producent Farmaceutyczny",
      doses: [10, 20, 50],
      unit: "mg",
      description: "Preparat dostępny w aptekach. Stosować zgodnie z ulotką lub zaleceniami lekarza."
    })
    idCounter++
  }
  return arr
}

const fullLocalDrugsDb = [...localDrugsDb, ...generateNFZ()]
const sortedLocalDrugsDb = [...fullLocalDrugsDb].sort((a, b) => a.name.localeCompare(b.name))

const interactionsDb = [
  { drug1_id: 2, drug2_id: 86, type: "NEGATIVE", severity: "Wysokie", description: "Ibuprofen osłabia kardioprotekcyjne działanie kwasu acetylosalicylowego. Łączenie tych leków znacząco zwiększa ryzyko groźnych krwawień z przewodu pokarmowego." },
  { drug1_id: 81, drug2_id: 12, type: "NEGATIVE", severity: "Bardzo wysokie", description: "Azytromycyna może drastycznie nasilać przeciwzakrzepowe działanie warfaryny. Wymaga ścisłego monitorowania wskaźnika INR, występuje ryzyko silnego krwotoku." },
  { drug1_id: 41, drug2_id: 44, type: "POSITIVE", severity: "Korzystne", description: "Bardzo częsta i korzystna terapia skojarzona w leczeniu cukrzycy typu 2. Leki te wspólnie i bezpiecznie zwiększają kontrolę glikemii u pacjenta." },
  { drug1_id: 21, drug2_id: 25, type: "POSITIVE", severity: "Korzystne", description: "Leki te często i bezpiecznie łączy się w terapii nadciśnienia tętniczego oraz niewydolności serca. Wykazują pozytywne działanie synergiczne." },
  { drug1_id: 89, drug2_id: 24, type: "NEGATIVE", severity: "Umiarkowane", description: "Oba leki obniżają ciśnienie krwi. Jednoczesne stosowanie może prowadzić do objawowego niedociśnienia, zawrotów głowy i omdleń." },
  { drug1_id: 101, drug2_id: 58, type: "NEGATIVE", severity: "Bardzo wysokie", description: "Łączenie kodeiny (Thiocodin) z benzodiazepinami (Alprazolam) silnie potęguje działanie depresyjne na ośrodkowy układ nerwowy. Grozi to zatrzymaniem oddechu i śpiączką." },
  { drug1_id: 102, drug2_id: 1, type: "NEGATIVE", severity: "Wysokie", description: "Solpadeine posiada w swoim składzie dużą dawkę paracetamolu. Dodatkowe przyjmowanie czystego paracetamolu grozi ciężkim uszkodzeniem, a nawet martwicą wątroby." },
  { drug1_id: 106, drug2_id: 105, type: "NEGATIVE", severity: "Wysokie", description: "Oba leki to wieloskładnikowe preparaty na przeziębienie zawierające m.in. paracetamol i substancje obkurczające naczynia. Ryzyko przedawkowania, skoków ciśnienia i tachykardii." }
]

const MiniCalendar = ({ med, daysOffset, isDarkMode }) => {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const endDate = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000)

  const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

  const viewMonth = viewDate.getMonth()
  const viewYear = viewDate.getFullYear()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  let firstDayIndex = new Date(viewYear, viewMonth, 1).getDay()
  firstDayIndex = (firstDayIndex + 6) % 7

  const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"]

  const days = []
  for (let i = 0; i < firstDayIndex; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const historySet = new Set(med.history || [])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden w-full"
    >
      <div className={`mt-3 p-3 rounded-xl border ${isDarkMode ? 'bg-[#15202b]/80 border-gray-700' : 'bg-white border-gray-200'} shadow-sm text-sm select-none`}>

        <div className="flex justify-between items-center mb-3">
          <button onClick={handlePrev} className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="font-bold text-base">{monthNames[viewMonth]} {viewYear}</div>
          <button onClick={handleNext} className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-semibold mb-2 opacity-60 text-xs uppercase tracking-wide">
          <div>Pn</div><div>Wt</div><div>Śr</div><div>Cz</div><div>Pt</div><div>Sb</div><div>Nd</div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />

            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const isTaken = historySet.has(dateStr)
            const isEndDate = endDate.getFullYear() === viewYear && endDate.getMonth() === viewMonth && endDate.getDate() === d
            const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d

            let dayClasses = "py-1.5 rounded-md flex items-center justify-center transition-colors relative "

            if (isTaken) {
              dayClasses += "bg-[#20602C] text-white font-bold shadow-sm "
            } else if (isToday) {
              dayClasses += isDarkMode ? "bg-gray-700 text-white font-bold " : "bg-gray-200 text-gray-900 font-bold "
            } else {
              dayClasses += isDarkMode ? "hover:bg-gray-800 " : "hover:bg-gray-100 "
            }

            return (
              <div key={i} className={dayClasses}>
                <span className="relative z-10">{d}</span>
                {isEndDate && !isTaken && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm z-20"></span>
                )}
                {isEndDate && isTaken && (
                  <span className="absolute bottom-0 w-full h-1 bg-red-500 rounded-b-md z-20"></span>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium opacity-80 justify-center">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#20602C]"></span> Wzięta dawka</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm flex items-end justify-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span></span> Koniec zapasu</div>
        </div>
      </div>
    </motion.div>
  )
}

function App() {
  const [meds, setMeds] = useState(() => {
    const saved = localStorage.getItem('mojeLeki')
    if (saved) {
      return JSON.parse(saved)
    }
    return []
  })

  const [user, setUser] = useState(null)
  const [isCloudSyncing, setIsCloudSyncing] = useState(true) // <--- NOWE (zapobiega nadpisywaniu bazy przy starcie)

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('lekoDarkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [notificationPermission, setNotificationPermission] = useState(
    ("Notification" in window) ? Notification.permission : "denied"
  )

  const [activeTab, setActiveTab] = useState('moje')
  const [searchQuery, setSearchQuery] = useState('')

  const [intSearch1, setIntSearch1] = useState('')
  const [intSearch2, setIntSearch2] = useState('')
  const [intDrug1, setIntDrug1] = useState(null)
  const [intDrug2, setIntDrug2] = useState(null)
  const [intOpen1, setIntOpen1] = useState(false)
  const [intOpen2, setIntOpen2] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [formSearchOpen, setFormSearchOpen] = useState(false)

  const [newName, setNewName] = useState('')
  const [newDose, setNewDose] = useState('')
  const [newUnit, setNewUnit] = useState('mg')
  const [newTotalPills, setNewTotalPills] = useState('')
  const [newPillsPerDay, setNewPillsPerDay] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [suggestedDoses, setSuggestedDoses] = useState([])
  const [expandedCards, setExpandedCards] = useState({})
  const [expandedDbCards, setExpandedDbCards] = useState({})
  const [openCalendarId, setOpenCalendarId] = useState(null)
  const [solpadeineClicks, setSolpadeineClicks] = useState([])



  useEffect(() => {
    localStorage.setItem('lekoDarkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.body.style.backgroundColor = "#15202b"
    } else {
      document.body.style.backgroundColor = "#f3f4f6"
    }
  }, [isDarkMode])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists() && docSnap.data().meds) {
            setMeds(docSnap.data().meds);
          } else if (meds.length > 0) {
            await setDoc(userDocRef, { meds: meds }, { merge: true });
          }
        } catch (error) {
          console.error("Błąd pobierania danych z Firebase:", error);
        }
      }
      setIsCloudSyncing(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('mojeLeki', JSON.stringify(meds))

    if (user && !isCloudSyncing) {
      const saveToCloud = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, { meds: meds }, { merge: true });
        } catch (error) {
          console.error("Błąd zapisu w chmurze:", error);
        }
      };
      saveToCloud();
    }
  }, [meds, user, isCloudSyncing])

  useEffect(() => {
    const found = fullLocalDrugsDb.find(d => d.name.toLowerCase() === newName.trim().toLowerCase());
    if (found && found.doses) {
      setSuggestedDoses(found.doses);
      if (!newDose) setNewUnit(found.unit || 'mg');
    } else {
      setSuggestedDoses([]);
    }
  }, [newName, newDose])

  useEffect(() => {
    if (notificationPermission === "granted") {
      meds.forEach(med => {
        const stats = getMedStats(med)
        if (stats.dni <= 7 && stats.dni > 0) {
          const today = new Date().toLocaleDateString()
          const lastNotified = localStorage.getItem(`notified_${med.id}`)

          if (lastNotified !== today) {
            new Notification("LEKalendarz - przypomnienie", {
              body: `Kończy Ci się lek ${med.name}. Zostało na ${stats.dni} dni. Czas załatwić receptę.`,
              icon: "/logo.jpg"
            })
            localStorage.setItem(`notified_${med.id}`, today)
          }
        }
      })
    }
  }, [meds, notificationPermission])

  const handleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Błąd podczas logowania: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Błąd podczas wylogowywania: ", error);
    }
  };

  const requestNotifications = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission)
        if (permission === "granted") {
          new Notification("LEKalendarz", {
            body: "Powiadomienia działają poprawnie! Będziemy Cię informować o brakach w lekach.",
            icon: "/logo.jpg"
          })
        } else {
          alert("Musisz zezwolić na powiadomienia w ustawieniach przeglądarki, żeby to działało.")
        }
      })
    } else {
      alert("Twoja przeglądarka nie wspiera powiadomień systemowych.")
    }
  }

  const getMedStats = (med) => {
    const start = new Date(med.startDate)
    const today = new Date()
    const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    const safeDaysPassed = daysPassed > 0 ? daysPassed : 0

    const pillsTaken = safeDaysPassed * med.pillsPerDay
    const pillsLeft = med.totalPills - pillsTaken > 0 ? med.totalPills - pillsTaken : 0
    const daysLeft = Math.floor(pillsLeft / med.pillsPerDay)

    return { dni: daysLeft > 0 ? daysLeft : 0, zapas: pillsLeft }
  }

  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))

  const handleDbCardClick = (id, drugName) => {
    setExpandedDbCards(prev => ({ ...prev, [id]: !prev[id] }))

    if (drugName && drugName.toLowerCase() === 'solpadeine') {
      const now = Date.now()
      setSolpadeineClicks(prev => {
        const validClicks = prev.filter(time => now - time <= 10000)
        validClicks.push(now)
        if (validClicks.length >= 10) {
          window.location.href = 'https://www.youtube.com/watch?v=8EI_cXZLJRA'
          return []
        }
        return validClicks
      })
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setNewName('')
    setNewDose('')
    setNewUnit('mg')
    setNewTotalPills('')
    setNewPillsPerDay('')
    setFormSearchOpen(false)
    setSuggestedDoses([])
  }

  const handleSaveMed = (e) => {
    e.preventDefault()
    if (!newName || !newTotalPills || !newPillsPerDay) return

    if (editingId) {
      setMeds(meds.map(med => med.id === editingId ? {
        ...med,
        name: newName,
        dose: newDose,
        unit: newUnit,
        totalPills: parseInt(newTotalPills),
        packageSize: parseInt(newTotalPills),
        pillsPerDay: parseInt(newPillsPerDay)
      } : med))
    } else {
      const newMed = {
        id: Date.now(),
        name: newName,
        dose: newDose,
        unit: newUnit,
        totalPills: parseInt(newTotalPills),
        packageSize: parseInt(newTotalPills),
        pillsPerDay: parseInt(newPillsPerDay),
        startDate: new Date().toISOString(),
        history: [],
        isFavorite: false
      }
      setMeds([newMed, ...meds])
    }
    closeForm()
  }

  const handleEdit = (med) => {
    setEditingId(med.id)
    setNewName(med.name)
    setNewDose(med.dose || '')
    setNewUnit(med.unit || 'mg')
    setNewTotalPills(med.totalPills.toString())
    setNewPillsPerDay(med.pillsPerDay.toString())
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten lek ze swojej listy?")) {
      setMeds(meds.filter(med => med.id !== id))
    }
  }

  const handleTakePill = (id) => {
    setMeds(meds.map(med => {
      if (med.id === id) {
        const start = new Date(med.startDate)
        const today = new Date()
        const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24))
        const safeDaysPassed = daysPassed > 0 ? daysPassed : 0
        const pillsTaken = safeDaysPassed * med.pillsPerDay
        const aktualnyZapas = med.totalPills - pillsTaken

        if (aktualnyZapas > 0) {
          localStorage.removeItem(`notified_${id}`)

          const y = today.getFullYear()
          const m = String(today.getMonth() + 1).padStart(2, '0')
          const d = String(today.getDate()).padStart(2, '0')
          const localTodayStr = `${y}-${m}-${d}`

          const newHistory = med.history ? [...med.history] : []
          if (!newHistory.includes(localTodayStr)) {
            newHistory.push(localTodayStr)
          }

          return { ...med, totalPills: med.totalPills - 1, history: newHistory }
        }
      }
      return med
    }))
  }

  const handleAddPackage = (id) => {
    setMeds(meds.map(med => {
      if (med.id === id) {
        const size = med.packageSize || parseInt(window.prompt("Ile tabletek ma nowe opakowanie?", "30") || "0")
        if (size > 0) {
          localStorage.removeItem(`notified_${id}`)
          return { ...med, totalPills: med.totalPills + size, packageSize: size }
        }
      }
      return med
    }))
  }

  const toggleFavorite = (id) => {
    setMeds(meds.map(med => med.id === id ? { ...med, isFavorite: !med.isFavorite } : med))
  }

  const addToGoogleCalendar = (medName, dataKonca) => {
    const text = encodeURIComponent(`Wykupić receptę: ${medName}`);
    const details = encodeURIComponent(`Przypomnienie z aplikacji LEKalendarz.\nZapas leku wystarczy do: ${dataKonca}. Czas zorganizować nową receptę!`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`;
    window.open(url, '_blank');
  }

  const sendEmailToClinic = (medName, packageSize) => {
    const subject = encodeURIComponent(`Prośba o e-receptę - ${medName}`)
    const body = encodeURIComponent(
      `Dzień dobry,\n\nZwracam się z uprzejmą prośbą o wystawienie e-recepty na lek:\n- ${medName} (potrzebna ilość: ${packageSize || 'standardowe opakowanie'} szt.)\n\nMoje dane osobowe do weryfikacji:\nImię i nazwisko: [PROSZĘ UZUPEŁNIĆ]\nPESEL: [PROSZĘ UZUPEŁNIĆ]\n\nZ poważaniem,\n[PROSZĘ UZUPEŁNIĆ IMIĘ I NAZWISKO]`
    )
    window.location.href = `mailto:rejestracja@twojaprzychodnia.pl?subject=${subject}&body=${body}`
  }

  const sortedMeds = [...meds].sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))

  const searchResults = sortedLocalDrugsDb.filter(drug => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (drug.name || '').toLowerCase().includes(q);
    const subMatch = (drug.substance || '').toLowerCase().includes(q);
    return nameMatch || subMatch;
  })

  const formSearchResults = sortedLocalDrugsDb.filter(drug => {
    const q = newName.toLowerCase();
    const nameMatch = (drug.name || '').toLowerCase().includes(q);
    const subMatch = (drug.substance || '').toLowerCase().includes(q);
    return nameMatch || subMatch;
  })

  const checkInteraction = () => {
    if (!intDrug1 || !intDrug2) return null;
    if (intDrug1 === intDrug2) {
      return { type: "SAME", description: "Wybrano ten sam lek dwukrotnie. Oczywiście nie ma sensu sprawdzać jego interakcji z samym sobą." }
    }
    const found = interactionsDb.find(i => (i.drug1_id === intDrug1 && i.drug2_id === intDrug2) || (i.drug1_id === intDrug2 && i.drug2_id === intDrug1));
    if (found) return found;
    return { type: "NEUTRAL", description: "Według naszej lokalnej bazy danych, te leki nie wchodzą ze sobą w żadne groźne interakcje. Mimo to, zawsze postępuj zgodnie z zaleceniami lekarza." }
  }

  const currentInteraction = checkInteraction();

  const tabsData = [
    { id: 'moje', label: 'Moje leki' },
    { id: 'baza', label: 'Baza leków' },
    { id: 'interakcje', label: 'Sprawdź interakcje' }
  ]

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 font-sans ${isDarkMode ? 'bg-[#15202b] text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto relative pb-24 w-full">

        <header className={`sticky top-0 z-40 py-4 -mx-4 px-4 md:-mx-8 md:px-8 mb-4 flex items-center gap-4 transition-all duration-500 backdrop-blur-xl border-b shadow-sm ${isDarkMode ? 'bg-[#15202b]/50 border-gray-700/50' : 'bg-white/50 border-white/60'}`}>
          <img src="/logo.jpg" alt="Logo LEKalendarz" className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-md shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">LEKalendarz</h1>
            <p className={`font-medium text-sm md:text-base transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Miej leki pod kontrolą</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {notificationPermission !== "granted" && (
              <button onClick={requestNotifications} className={`hidden md:block px-4 py-2 rounded-xl font-bold text-xs md:text-sm shadow-sm transition-all active:scale-95 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                Włącz powiadomienia
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 md:gap-3 bg-white/10 p-1 pr-3 md:p-1.5 md:pr-4 rounded-full border border-current/10">
                <img src={user.photoURL} alt="Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shadow-sm" />
                <div className="hidden md:block text-sm">
                  <p className="font-bold leading-none mb-0.5">{user.displayName.split(' ')[0]}</p>
                  <button onClick={handleLogout} className="text-xs opacity-70 hover:opacity-100 uppercase tracking-wider font-bold text-red-500">Wyloguj</button>
                </div>
                <button onClick={handleLogout} className="md:hidden ml-1 p-1 opacity-70 hover:opacity-100">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                <span className="hidden sm:block">Google</span>
              </button>
            )}

            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm active:scale-90 ${isDarkMode ? 'bg-[#1c2733] text-yellow-400 hover:bg-[#22303f]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.svg key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.3 }} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </motion.svg>
                ) : (
                  <motion.svg key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.3 }} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </div>
        </header>

        <div className={`flex flex-col sm:flex-row mb-8 p-1.5 rounded-xl w-full max-w-2xl mx-auto transition-colors duration-500 shadow-sm gap-1 relative ${isDarkMode ? 'bg-[#1c2733]' : 'bg-gray-200'}`}>
          {tabsData.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 sm:py-2.5 text-sm font-bold rounded-lg transition-colors duration-300 relative z-10 outline-none ${activeTab === tab.id ? 'text-white' : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')}`}>
              {activeTab === tab.id && (
                <motion.div layoutId="active-tab-bubble" className="absolute inset-0 bg-[#20602C] rounded-lg shadow-md -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'moje' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {notificationPermission !== "granted" && (
              <button onClick={requestNotifications} className={`w-full md:hidden mb-6 px-4 py-3 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 text-center ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                Włącz powiadomienia o lekach
              </button>
            )}

            {meds.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-lg font-bold">Twoja apteczka jest pusta</p>
                <p className="text-sm mt-1">Kliknij plusik w rogu, aby dodać swój pierwszy lek.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <AnimatePresence>
                  {sortedMeds.map(med => {
                    const { dni, zapas } = getMedStats(med)
                    const dataKonca = new Date(Date.now() + dni * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL')
                    const isExpanded = expandedCards[med.id]

                    let kolor = isDarkMode ? "bg-[#20602C]/20 border-[#20602C] text-gray-300" : "bg-green-100 border-[#20602C] text-gray-900"
                    let alert = "Zapas jest wystarczający"
                    let btnAkcja = "bg-[#20602C] hover:bg-[#184821] text-white"

                    if (dni < 3) {
                      kolor = isDarkMode ? "bg-red-900/20 border-red-600 text-red-400" : "bg-red-100 border-red-500 text-red-900"
                      alert = "Krytycznie mało! Zamów receptę."
                      btnAkcja = isDarkMode ? "bg-red-600 hover:bg-red-500 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                    } else if (dni <= 7) {
                      kolor = isDarkMode ? "bg-amber-900/20 border-amber-600 text-amber-400" : "bg-amber-100 border-amber-500 text-amber-900"
                      alert = "Końcówka, pomyśl o recepcie."
                      btnAkcja = isDarkMode ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"
                    }

                    return (
                      <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 350, damping: 25 }} key={med.id} className={`p-5 rounded-xl border-l-8 shadow-sm relative flex flex-col transition-colors duration-500 ${kolor}`}>
                        <div className="absolute top-3 left-4 flex items-center gap-3">
                          <button onClick={() => toggleFavorite(med.id)} className="active:scale-90 transition-transform focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-6 h-6 stroke-current drop-shadow-sm transition-colors duration-200 ${med.isFavorite ? 'fill-yellow-400 stroke-yellow-500' : 'fill-transparent opacity-50 hover:opacity-100'}`} strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          <button onClick={() => handleEdit(med)} className="text-xs md:text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity">Edytuj</button>
                        </div>

                        <button onClick={() => handleDelete(med.id)} className="absolute top-2 right-4 text-2xl font-bold opacity-50 hover:opacity-100 transition-opacity leading-none">×</button>

                        <div className="flex justify-between items-end pr-2 mt-8 md:mt-10 gap-2 flex-grow">
                          <h2 className="text-xl md:text-2xl font-bold leading-tight mb-1">
                            {med.name} {med.dose && <span className="opacity-80 font-semibold">{med.dose}{med.unit}</span>}
                          </h2>

                          <div className="text-right min-w-[3.5rem]">
                            <span className="text-4xl md:text-5xl font-black block leading-none">{dni}</span>
                            <span className="text-xs md:text-sm uppercase font-bold opacity-80 mt-1 block">Dni</span>
                          </div>
                        </div>

                        <p className="mt-3 text-sm md:text-base font-bold opacity-90">{alert}</p>

                        <div className="mt-3 pt-3 border-t border-current/20 flex flex-col gap-2 text-sm md:text-base font-semibold opacity-80">
                          <div className="flex justify-between items-center w-full">
                            <span>Wystarczy do:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setOpenCalendarId(openCalendarId === med.id ? null : med.id)}
                                className={`px-2 py-1 rounded-lg transition-colors border ${openCalendarId === med.id ? (isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-200 border-gray-400') : 'border-transparent hover:border-current/20'}`}
                              >
                                {dataKonca}
                              </button>
                              <button onClick={() => addToGoogleCalendar(med.name, dataKonca)} title="Przypomnij w Google Calendar" className={`p-1.5 rounded-lg transition-all active:scale-95 ${isDarkMode ? 'bg-[#1c2733] hover:bg-gray-700 text-blue-400' : 'bg-white hover:bg-gray-100 text-blue-600 shadow-sm'}`}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {openCalendarId === med.id && <MiniCalendar med={med} daysOffset={dni} isDarkMode={isDarkMode} />}
                          </AnimatePresence>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="mt-3 pt-3 border-t border-current/20 flex flex-col gap-3 text-sm md:text-base">
                                <div className="flex justify-between items-center mb-1">
                                  <div><span className="block text-xs uppercase font-bold opacity-70">W zapasie</span><span className="font-bold">{zapas} szt.</span></div>
                                  <div className="text-right"><span className="block text-xs uppercase font-bold opacity-70">Dawkowanie</span><span className="font-bold">{med.pillsPerDay} / dobę</span></div>
                                </div>

                                <div className="flex gap-2">
                                  <button onClick={() => handleTakePill(med.id)} className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm shadow-sm active:scale-95 transition-all text-center border ${isDarkMode ? 'bg-[#1c2733]/80 hover:bg-[#1c2733] border-current/20 text-current' : 'bg-white/70 hover:bg-white text-gray-900 border-gray-300/50'}`}>
                                    Wzięta dawka
                                  </button>
                                  <button onClick={() => handleAddPackage(med.id)} className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm shadow-sm active:scale-95 transition-all text-center ${btnAkcja}`}>
                                    Nowe opakowanie
                                  </button>
                                </div>

                                {dni <= 7 && (
                                  <button onClick={() => sendEmailToClinic(med.name, med.packageSize)} className={`w-full py-2.5 md:py-3 mt-1 rounded-xl font-bold text-xs md:text-sm shadow-sm active:scale-95 transition-all text-center border ${isDarkMode ? 'bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/50 text-amber-400' : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'}`}>
                                    Napisz email do przychodni
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button onClick={() => toggleCard(med.id)} className="w-full mt-3 pt-2 text-xs md:text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 text-center">
                          {isExpanded ? "Zwiń szczegóły" : "Rozwiń szczegóły"}
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'baza' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="relative mb-6 md:mb-8">
              <input type="text" placeholder="Wyszukaj po nazwie lub substancji..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full px-4 py-4 border rounded-xl outline-none focus:ring-2 transition-colors duration-300 text-base md:text-lg shadow-sm ${isDarkMode ? 'bg-[#1c2733] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-white border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.length > 0 ? (
                searchResults.map((drug) => {
                  const isExpanded = expandedDbCards[drug.id];
                  return (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={drug.id} onClick={() => handleDbCardClick(drug.id, drug.name)} className={`p-5 rounded-xl border-l-4 shadow-sm flex flex-col cursor-pointer transition-colors duration-500 ${isDarkMode ? 'bg-[#1c2733] border-[#20602C] hover:bg-[#22303f]' : 'bg-white border-[#20602C] hover:bg-gray-50'}`}>
                      <h3 className="text-lg md:text-xl font-bold leading-tight mb-1">{drug.name || 'Nieznana nazwa'}</h3>
                      <p className={`text-sm md:text-base font-semibold mb-3 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{drug.substance || 'Brak danych o substancji'}</p>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-3 pt-3 border-t border-current/10 text-sm md:text-base">
                              <p className="font-semibold mb-1 opacity-90">Właściwości i działanie:</p>
                              <p className="opacity-80 leading-relaxed">{drug.description || "Brak szczegółowego opisu dla tego leku w lokalnej bazie."}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className={`mt-auto pt-4 flex justify-between items-center text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Producent: {drug.producer || 'Nieznany producent'}</span>
                        <span className="uppercase tracking-wider opacity-60">{isExpanded ? "Zwiń" : "Właściwości"}</span>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className={`col-span-full py-10 text-center font-semibold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Brak wyników dla wpisanej frazy.</div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'interakcje' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-4">
            <div className={`p-6 md:p-8 rounded-2xl shadow-sm border transition-colors duration-500 ${isDarkMode ? 'bg-[#1c2733] border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Sprawdź interakcje medyczne</h2>
              <div className="flex flex-col gap-6">
                <div className="relative">
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wider opacity-80 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pierwszy lek</label>
                  <input type="text" value={intSearch1} onChange={(e) => { setIntSearch1(e.target.value); setIntDrug1(null); setIntOpen1(true); }} onFocus={() => setIntOpen1(true)} onBlur={() => setTimeout(() => setIntOpen1(false), 200)} placeholder="Wyszukaj i wybierz z listy..." className={`w-full p-4 rounded-xl border outline-none focus:ring-2 transition-colors duration-300 font-medium ${isDarkMode ? 'bg-[#15202b] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`} />
                  <AnimatePresence>
                    {intOpen1 && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute w-full mt-2 rounded-xl shadow-xl border overflow-hidden z-50 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-[#1c2733] border-gray-700' : 'bg-white border-gray-200'}`}>
                        {sortedLocalDrugsDb.filter(d => d.name.toLowerCase().includes(intSearch1.toLowerCase()) || d.substance.toLowerCase().includes(intSearch1.toLowerCase())).length > 0 ? (
                          sortedLocalDrugsDb.filter(d => d.name.toLowerCase().includes(intSearch1.toLowerCase()) || d.substance.toLowerCase().includes(intSearch1.toLowerCase())).map(d => (
                            <div key={d.id} onMouseDown={() => { setIntDrug1(d.id); setIntSearch1(`${d.name} (${d.substance})`); setIntOpen1(false); }} className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-[#22303f]' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <div className="font-bold">{d.name}</div>
                              <div className="text-xs opacity-60">{d.substance}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center opacity-60 text-sm">Brak wyników w bazie.</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-center -my-2 relative z-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#15202b] border-[#1c2733] text-gray-400' : 'bg-gray-100 border-white text-gray-500'}`}>VS</div>
                </div>

                <div className="relative">
                  <label className={`block text-sm font-bold mb-2 uppercase tracking-wider opacity-80 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drugi lek</label>
                  <input type="text" value={intSearch2} onChange={(e) => { setIntSearch2(e.target.value); setIntDrug2(null); setIntOpen2(true); }} onFocus={() => setIntOpen2(true)} onBlur={() => setTimeout(() => setIntOpen2(false), 200)} placeholder="Wyszukaj i wybierz z listy..." className={`w-full p-4 rounded-xl border outline-none focus:ring-2 transition-colors duration-300 font-medium ${isDarkMode ? 'bg-[#15202b] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`} />
                  <AnimatePresence>
                    {intOpen2 && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute w-full mt-2 rounded-xl shadow-xl border overflow-hidden z-50 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-[#1c2733] border-gray-700' : 'bg-white border-gray-200'}`}>
                        {sortedLocalDrugsDb.filter(d => d.name.toLowerCase().includes(intSearch2.toLowerCase()) || d.substance.toLowerCase().includes(intSearch2.toLowerCase())).length > 0 ? (
                          sortedLocalDrugsDb.filter(d => d.name.toLowerCase().includes(intSearch2.toLowerCase()) || d.substance.toLowerCase().includes(intSearch2.toLowerCase())).map(d => (
                            <div key={d.id} onMouseDown={() => { setIntDrug2(d.id); setIntSearch2(`${d.name} (${d.substance})`); setIntOpen2(false); }} className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-[#22303f]' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <div className="font-bold">{d.name}</div>
                              <div className="text-xs opacity-60">{d.substance}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center opacity-60 text-sm">Brak wyników w bazie.</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-current/10 relative z-0">
                {!intDrug1 || !intDrug2 ? (
                  <p className="text-center font-medium opacity-60">Wyszukaj i kliknij w dwa leki z listy, aby zobaczyć wynik.</p>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-xl border-l-8 ${currentInteraction.type === 'NEGATIVE' ? (isDarkMode ? 'bg-red-900/20 border-red-600' : 'bg-red-50 border-red-500') : currentInteraction.type === 'POSITIVE' ? (isDarkMode ? 'bg-[#20602C]/20 border-[#20602C]' : 'bg-emerald-50 border-emerald-500') : currentInteraction.type === 'SAME' ? (isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-400') : (isDarkMode ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-500')}`}>
                    <h3 className={`text-lg font-bold mb-2 ${currentInteraction.type === 'NEGATIVE' ? (isDarkMode ? 'text-red-400' : 'text-red-700') : currentInteraction.type === 'POSITIVE' ? (isDarkMode ? 'text-[#4ade80]' : 'text-[#20602C]') : currentInteraction.type === 'SAME' ? (isDarkMode ? 'text-gray-300' : 'text-gray-700') : (isDarkMode ? 'text-blue-400' : 'text-blue-700')}`}>
                      {currentInteraction.type === 'NEGATIVE' ? `Zagrożenie: ${currentInteraction.severity}` : currentInteraction.type === 'POSITIVE' ? `Pozytywne połączenie (${currentInteraction.severity})` : currentInteraction.type === 'SAME' ? 'Błąd logiki' : 'Brak znanych groźnych interakcji'}
                    </h3>
                    <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{currentInteraction.description}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`rounded-2xl p-6 md:p-8 w-full max-w-sm md:max-w-md shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-[#1c2733] text-gray-100' : 'bg-white text-gray-800'}`}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{editingId ? "Edytuj lek" : "Dodaj nowy lek"}</h2>
                <form onSubmit={handleSaveMed} className="space-y-4 md:space-y-5">
                  <div className="relative">
                    <label className={`block text-sm md:text-base font-semibold mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Nazwa leku</label>
                    <input type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setFormSearchOpen(true); }} onFocus={() => setFormSearchOpen(true)} onBlur={() => setTimeout(() => setFormSearchOpen(false), 200)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition-colors duration-300 text-base ${isDarkMode ? 'bg-[#15202b] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-white border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`} placeholder="np. Apap Noc (wpisz lub wyszukaj)" autoComplete="off" />
                    <AnimatePresence>
                      {formSearchOpen && newName.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute w-full mt-2 rounded-xl shadow-xl border overflow-hidden z-50 max-h-48 overflow-y-auto ${isDarkMode ? 'bg-[#1c2733] border-gray-700' : 'bg-white border-gray-200'}`}>
                          {formSearchResults.length > 0 ? (
                            formSearchResults.map(d => (
                              <div key={d.id} onMouseDown={() => { setNewName(d.name); setFormSearchOpen(false); if (d.doses) { setSuggestedDoses(d.doses); setNewUnit(d.unit || 'mg'); } else { setSuggestedDoses([]); } }} className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-[#22303f]' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <div className="font-bold">{d.name}</div>
                                <div className="text-xs opacity-60">{d.substance}</div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center opacity-60 text-sm">Brak w bazie (zostanie zapisany jako własny)</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <div className="flex gap-4 mb-2">
                      <div className="flex-[2]">
                        <label className={`block text-sm md:text-base font-semibold mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Dawka (opcjonalnie)</label>
                        <input type="number" step="any" value={newDose} onChange={(e) => setNewDose(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition-colors duration-300 text-base ${isDarkMode ? 'bg-[#15202b] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-white border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`} placeholder="np. 400" />
                      </div>
                      <div className="flex-1">
                        <label className={`block text-sm md:text-base font-semibold mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Jedn.</label>
                        <select value={newUnit} onChange={(e) => setNewUnit(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition-colors duration-300 text-base appearance-none cursor-pointer ${isDarkMode ? 'bg-[#15202b] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-white border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`}>
                          <option value="mg">mg</option>
                          <option value="g">g</option>
                          <option value="µg">µg</option>
                          <option value="ml">ml</option>
                        </select>
                      </div>
                    </div>

                    <AnimatePresence>
                      {suggestedDoses.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-2 overflow-hidden">
                          {suggestedDoses.map(d => (
                            <button key={d} type="button" onClick={() => setNewDose(d)} className={`px-3 py-1.5 text-sm font-bold rounded-lg border transition-colors ${newDose == d ? (isDarkMode ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-[#20602C] border-[#20602C] text-white') : (isDarkMode ? 'bg-[#15202b] border-gray-600 text-gray-300 hover:bg-gray-800' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-200')}`}>
                              {d} {newUnit}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={`block text-sm md:text-base font-semibold mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>W paczce</label>
                      <input type="number" value={newTotalPills} onChange={(e) => setNewTotalPills(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition-colors duration-300 text-base ${isDarkMode ? 'bg-[#15202b] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-white border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`} placeholder="np. 50" />
                    </div>
                    <div className="flex-1">
                      <label className={`block text-sm md:text-base font-semibold mb-1 transition-colors duration-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Na dobę</label>
                      <input type="number" value={newPillsPerDay} onChange={(e) => setNewPillsPerDay(e.target.value)} className={`w-full border rounded-lg p-3 outline-none focus:ring-2 transition-colors duration-300 text-base ${isDarkMode ? 'bg-[#15202b] border-gray-700 text-gray-100 focus:border-[#20602C] focus:ring-[#20602C]/50' : 'bg-white border-gray-300 text-gray-900 focus:border-[#20602C] focus:ring-[#20602C]/30'}`} placeholder="np. 2" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6 md:mt-8">
                    <button type="button" onClick={closeForm} className={`flex-1 py-3 font-bold rounded-xl transition-colors text-base ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>Anuluj</button>
                    <button type="submit" className="flex-1 py-3 bg-[#20602C] hover:bg-[#184821] text-white font-bold rounded-xl shadow-md transition-colors text-base">Zapisz</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'moje' && (
          <button onClick={() => { closeForm(); setShowForm(true); }} className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-16 h-16 md:w-20 md:h-20 bg-[#20602C] hover:bg-[#184821] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      <footer className={`py-6 border-t mt-auto w-full transition-colors duration-500 ${isDarkMode ? 'border-gray-800 bg-[#15202b]' : 'border-gray-200 bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 opacity-70">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo LEKalendarz" className="w-6 h-6 rounded shadow-sm grayscale opacity-80 object-cover" />
            <span className="text-sm font-bold tracking-wide">LEKalendarz</span>
          </div>
          <p className="text-xs font-medium">© {new Date().getFullYear()} Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  )
}

export default App