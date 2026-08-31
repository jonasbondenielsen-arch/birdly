import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import next from "@next/eslint-plugin-next";

// ============================================================================
// LINT-GATE — bygget for at fange ÉN klasse fejl, som kostede os 5 dage.
//
// ⚠️ BAGGRUNDEN: `components/MineOpgaver.js` kaldte omfangTekst() uden at
// importere den. Det bygger fint, det deployer fint, og det kaster foerst naar
// en kunde rent faktisk HAR en privat opgave med et omfang — saa faar hun 500
// paa hele samlesiden. 12 kunder havde en doed side i 5 dage, foer nogen saa det.
//
// `no-undef` fanger praecis det: et navn der bruges uden at vaere defineret
// eller importeret. Reglen er derfor "error", ikke "warn" — en advarsel i en
// log ingen laeser, er det samme som ingenting.
//
// ⚠️ SCOPET ER SMALT MED VILJE. Det her er ikke en stil-lint. Der er tusindvis
// af linjer eksisterende kode, og en fuld regelpakke ville give hundredvis af
// fund, som ville blive slaaet fra igen i loebet af en uge. Kun regler der
// fanger noget der VIRKELIG gaar i stykker i produktion, er slaaet til.
//
// ⚠️ GLOBALS SKAL VAERE RIGTIGE, ellers er reglen ubrugelig. Uden browser- og
// node-globals ville `document`, `fetch` og `process` alle vaere "undefined",
// og saa druknede det aegte fund i stoej — og reglen ville blive slukket.
// ============================================================================

export default [
  {
    ignores: [
      ".next/**", "node_modules/**", "out/**", "public/**",
      "next.config.*", "postcss.config.*",
    ],
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
        // Next/React kraever ikke React i scope, men JSX-transformen er implicit.
        React: "readonly",
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    // ⚠️ PLUGINS REGISTRERES, MEN DERES REGLER ER IKKE SLAAET TIL. Koden har
    // allerede eslint-disable-kommentarer for @next/next og react-hooks; uden at
    // pluginnet er kendt, fejler ESLint paa selve kommentaren ("rule not found")
    // og drukner de aegte fund. De er her for at goere de kommentarer gyldige.
    plugins: { react, "react-hooks": reactHooks, "@next/next": next },
    rules: {
      // ⚠️ DE TO REGLER DER BAERER HELE FILEN.
      "no-undef": "error",
      // Samme fejl, men for en komponent brugt i JSX uden import — <Foo /> hvor
      // Foo aldrig blev importeret. Den giver noejagtig samme 500.
      "react/jsx-no-undef": "error",

      // Billige naboer til samme klasse: kald af noget der beviseligt ikke er
      // en funktion, og brug af en variabel foer den er defineret.
      "no-obj-calls": "error",
      "no-func-assign": "error",
      "use-isnan": "error",
      // ⚠️ "typeof x === 'undefind'" fanges her. Den slags tastefejl goer en
      // betingelse permanent falsk, uden at noget nogensinde fejler hoejlydt.
      "valid-typeof": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error",
    },
    settings: { react: { version: "detect" } },
  },
];
