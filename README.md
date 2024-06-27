ID-SK 3 Frontend ·
[![Build Status](https://github.com/alphagov/govuk-frontend/workflows/Tests/badge.svg)](https://github.com/alphagov/govuk-frontend/actions?query=workflow%3ATests+branch%3Amain)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
=====================
### Verzia: 3.0.1

ID-SK je komunitne rozvíjaný jednotný dizajnový systém Slovenska, ktorý má za cieľ zjednotiť používateľské rozhrania a spôsob komunikácie s používateľom pri poskytovaní elektronických služieb na Slovensku.

ID-SK Frontend obsahuje zdrojový kód, ktorý vychádza z [britského dizajn manuálu elektronických služieb GOV.UK (GDS)](https://design-system.service.gov.uk/).

## idsk.gov.sk
Živé príklady ID-SK komponentov s pokynmi ako ich využiť pri tvorbe vlastnej služby nájdete na [Dizajn manuále ID-SK](https://idsk.gov.sk/).

## Rozvoj ID-SK
 Našli ste v ID-SK chybu alebo chcete navrhnúť zmenu? Môžete tak urobiť priamo na GitHube 
 [Chyby a úpravy: https://github.com/id-sk/idsk3-frontend/issues](https://github.com/id-sk/idsk3-frontend/issues)
 [Diskusia: https://github.com/id-sk/idsk3-frontend/discussions](https://github.com/id-sk/idsk3-frontend/discussions)

## Kontakt na tím
ID-SK je tvorený pod záštitou Oddelenia behaviorálnych inovácií (oKPS) Ministerstva investícií, regionálneho rozvoja a informatizácie. Pre viac informácií svoje otázky smerujte na e-mail [ID-SK tímu idsk@mirri.gov.sk](mailto:idsk@mirri.gov.sk).


## Rýchly štart
Sú dva spôsoby, ako začať používať ID-SK Frontend vo vašej aplikácii.

### 1. Inštaláciou npm (odporúčame)
Odporúčame nainštalovať si ID-SK Frontend zo správcu balíčkov platformy [Node (NPM)](https://www.npmjs.com/package/@id-sk/frontend).

### 2. Inštaláciou kompilovaných súborov
Môžete si tiež stiahnuť skompilované a minifikované prvky (CSS, Javascript) z [GitHub] (https://github.com/id-sk/id-sk-frontend/tree/master/dist).
Po inštalácii budete môcť vo vašej službe používať kód z dizajn systému ID-SK.

## Podpora prehliadačov
ID-SK Frontend vám umožní budovať služby, ktoré sú v súlade s pokynmi uvedenými v [metodickom usmernení](https://idsk.gov.sk/uvod/metodika-ucd).
ID-SK Frontend oficiálne podporuje nasledovné prehliadače:

| Operačný systém | Prehliadač | Podpora |
|--|--|--|
| Windows | Internet Explorer 8-10 | funkčný |
| Windows | Internet Explorer 11 | vyhovujúci |
| Windows | Edge (posledné 2 verzie) | vyhovujúci |
| Windows | Google Chrome (posledné 2 verzie) | vyhovujúci |
| Windows | Mozilla Firefox (posledné 2 verzie) | vyhovujúci |
| macOS | Safari 9+ | vyhovujúci | 
| macOS | Google Chrome (posledné 2 verzie) | vyhovujúci | 
| macOS | Mozilla Firefox (posledné 2 verzie) | vyhovujúci |
| iOS | Safari for iOS 9.3+ | vyhovujúci |
| iOS | Google Chrome (posledné 2 verzie) | vyhovujúci |
| Android | Google Chrome (posledné 2 verzie) | vyhovujúci |
| Android | Samsung Internet (posledné 2 verzie) | vyhovujúci |

„Vyhovujúci“ znamená, že komponenty musia vyzerať i fungovať rovnako dobre ako v iných moderných prehliadačoch.

„Funkčný“ znamená, že komponenty nemusia v danom prehliadači vyzerať dokonale, ale musia byť stále použiteľné bez chýb.

V prípade, že v aplikácii generujete CSS súbory, ktorých súčasťou sú ID-SK štýly, na podporu prehliadača Internet Explorer 8 je potrebné vygenerovať a zahrnúť aj separátne štýly.

## Asistenčné technológie
ID-SK Frontend vám umožní budovať služby, ktoré sú v súlade s pokynmi uvedenými v [metodickom usmernení](https://idsk.gov.sk/uvod/metodika-ucd).

ID-SK Frontend oficiálne podporuje nasledovné asistenčné technológie:

| Softvér| Verzia| Typ| Prehliadač |
|--|--|--|--|
| JAWS | 15 alebo novšia | čítačka obrazovky | Internet Explorer 11 |
| ZoomText | 10.11 alebo novšia | zväčšovacia lupa | Internet Explorer 11 |
| Dragon NaturallySpeaking | 11 alebo novšia | rozpoznávač reči | Internet Explorer 11 |
| NVDA | 2016 alebo novšia | čítačka obrazovky | Firefox (najnovšie verzie) |
| VoiceOver | 7.0 alebo novšia | čítačka obrazovky | Safari na iOS10 a OS X |

Okrem toho testujeme, či je všetok obsah prístupný iba pomocou klávesnice.

Naším cieľom je podporovať používateľov, ktorí potrebujú upravené farby webových stránok, ktoré navštevujú. Testujeme to zmenou farieb v prehliadači Firefox, povolením režimu „Vysoký kontrast“ v operačnom systéme Windows a použitím doplnku „Vysoký kontrast“ pre prehliadač Chrome.

## Ako prispieť k ID-SK

Ak nám chcete pomôcť rozšíriť ID-SK Frontend, [pozrite si návod](https://github.com/id-sk/idsk3-frontend/blob/main/CONTRIBUTING.md)




## Accessibility

The GOV.UK Design System team works hard to ensure that GOV.UK Frontend is accessible.

Using Frontend will help your service meet [level AA of WCAG 2.1](https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag). But you must still [check that your service meets accessibility requirements](https://www.gov.uk/service-manual/helping-people-to-use-your-service/making-your-service-accessible-an-introduction), especially if you extend or modify components.

You should also use [the JavaScript from GOV.UK Frontend](https://frontend.design-system.service.gov.uk/importing-css-assets-and-javascript/#javascript) and read the [accessibility statement for the GOV.UK Design System](https://design-system.service.gov.uk/accessibility/).

## Known issues flagged by validators or automated testing tools

Check our [list of known issues that may be reported by HTML Validators or automated testing tools](https://github.com/orgs/alphagov/projects/37).

## Security

GDS is an advocate of responsible vulnerability disclosure. If you’ve found a vulnerability, we would like to know so we can fix it.

For full details on how to tell us about vulnerabilities, [see our security policy](https://github.com/alphagov/govuk-frontend/security/policy).

## Licence

Unless stated otherwise, the codebase is released under the MIT License. This
covers both the codebase and any sample code in the documentation. The
documentation is &copy; Crown copyright and available under the terms of the
Open Government 3.0 licence.

## Contributing

[To learn how to help us build GOV.UK Frontend, see our contribution guidelines.](CONTRIBUTING.md)

The govuk-frontend repository is public and we welcome contributions from anyone.

Contributors to alphagov repositories are expected to follow the [Contributor Covenant Code of Conduct](https://github.com/alphagov/.github/blob/main/CODE_OF_CONDUCT.md#contributor-covenant-code-of-conduct). Contributors working within government are also expected to follow the [Civil Service code](https://www.gov.uk/government/publications/civil-service-code/the-civil-service-code).

We're unable to monitor activity on this repository outside of our office hours (10am to 4pm, UK time). To get a faster response at other times, you can [report abuse or spam to GitHub](https://docs.github.com/en/communities/maintaining-your-safety-on-github/reporting-abuse-or-spam).
