const fs = require('fs');
const file = 'src/components/lightswind/AeroShards.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: Type 'number[]' is not assignable to type 'readonly [number, number]'
content = content.replace(/\[\s*x,\s*y\s*\]/g, "([x, y] as [number, number])");
content = content.replace(/= \[x, y\];/g, "= [x, y] as [number, number];");
// Other arrays assigned to readonly [number, number]
content = content.replace(/\[\s*width,\s*height\s*\]/g, "([width, height] as [number, number])");

// Fix 2: Property 'gpu' does not exist on type 'Navigator'
content = content.replace(/navigator\.gpu/g, "(navigator as any).gpu");

fs.writeFileSync(file, content);
