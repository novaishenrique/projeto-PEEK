// Testes automáticos do repositório: README, imagens e apresentação.
// Rodam no GitHub Actions a cada push. Localmente: node --test .github/tests/*.test.js
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..", "..");
const existe = (arquivo) => fs.existsSync(path.join(raiz, arquivo));

// Mesmo algoritmo que o GitHub usa para criar a âncora de um título
const ancora = (titulo) =>
  titulo.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "").replace(/ /g, "-");

test("README: links, imagens e âncoras apontam para o que existe", () => {
  const readme = fs.readFileSync(path.join(raiz, "README.md"), "utf8").replace(/```[\s\S]*?```/g, "");
  const ancoras = new Set([...readme.matchAll(/^#{1,6} (.+)$/gm)].map((m) => ancora(m[1])));
  const links = [
    ...[...readme.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]),
    ...[...readme.matchAll(/<img [^>]*src="([^"]+)"/g)].map((m) => m[1]),
  ].filter((link) => !/^(https?:|mailto:)/.test(link));
  for (const link of links) {
    const [alvo, fragmento] = decodeURI(link).split("#");
    if (alvo) assert.ok(existe(alvo), "link quebrado: " + link);
    else assert.ok(ancoras.has(fragmento), "âncora inexistente: #" + fragmento);
  }
});

test("a apresentação em PDF e a capa estão no repositório", () => {
  assert.ok(existe(".github/capa.jpg"), "faltando: .github/capa.jpg");
  const pdf = fs.readFileSync(path.join(raiz, "docs/PEEK_Hackathon_WECTI.pdf"));
  assert.strictEqual(pdf.subarray(0, 5).toString(), "%PDF-");
});

test("os 8 slides estão em imagem", () => {
  const slides = fs.readdirSync(path.join(raiz, "imagens")).filter((n) => /^slide-\d-.+\.jpg$/.test(n));
  assert.strictEqual(slides.length, 8, "slides encontrados: " + slides.join(", "));
});
