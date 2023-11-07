import fs from 'fs';

export function saveData(data: any, filename: string) {
  fs.writeFileSync(`db/data/${filename}`, JSON.stringify(data, null, 4));
}
