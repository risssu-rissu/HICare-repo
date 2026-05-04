const fs = require('fs');

function scopeCss(file, wrapperClass) {
  let css = fs.readFileSync(file, 'utf8');
  // Extract imports
  const importRegex = /@import url\([^)]+\);/g;
  const imports = css.match(importRegex) || [];
  css = css.replace(importRegex, '');
  
  // Wrap the rest
  css = `${imports.join('\n')}\n\n.${wrapperClass} {\n${css}\n}`;
  fs.writeFileSync(file, css);
  console.log(`Scoped ${file} with .${wrapperClass}`);
}

scopeCss('src/app/landing.css', 'landing-page');
scopeCss('src/app/auth.css', 'auth-page-wrapper');
scopeCss('src/app/style.css', 'dashboard-page-wrapper');
