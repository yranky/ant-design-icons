import svgtofont from "svgtofont";
import { resolve, dirname } from "path";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, rmSync, mkdirSync } from "fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_DIR = resolve(__dirname, '../packages/icons-svg/svg')
const TEMP_DIR = resolve(__dirname, '../temp')

//排除双色图标
const excludeDir = [resolve(BASE_DIR, 'twotone')]

if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR)
} else {
    rmSync(TEMP_DIR, { recursive: true })
    mkdirSync(TEMP_DIR)
}


const getFiles = (dir, svgFiles = []) => {
    const files = readdirSync(dir);
    files.forEach((file) => {
        const filePath = resolve(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            svgFiles.push(...getFiles(filePath));
        } else {
            svgFiles.push(filePath);
        }
    })
    return svgFiles;
}


const copySvgFileSync = (from, to) => {
    const content = readFileSync(from, { encoding: 'utf-8' })
        .replace('<?xml version="1.0" standalone="no"?>', '')
        .replace('<?xml version="1.0" encoding="utf-8"?>', '')
        .replace('<?xml version="1.0" encoding="UTF-8"?>', '');

    writeFileSync(to, content, { encoding: 'utf-8' });
}

const svg2fonts = async () => {
    const files = getFiles(BASE_DIR);

    files.forEach((file) => {
        const pathArr = file.split('/');
        const fileName = pathArr.pop();
        if (/\.svg$/.test(fileName) && !excludeDir.includes(dirname(file))) {
            const fileNameNoExt = fileName.replace('.svg', '');
            const fileNameAfterFix = pathArr.pop();
            copySvgFileSync(file, resolve(TEMP_DIR, `${fileNameNoExt}-${fileNameAfterFix}.svg`))
        }
    })

    svgtofont({
        src: TEMP_DIR,
        dist: resolve(__dirname, "../fonts/"),
        fontName: "antd-icon",
        css: true,
        svgicons2svgfont: {
            // 通过将图标缩放到最高图标的高度来规范化图标。
            normalize: true,
        },
        website: {
            title: "svgtofont",
            version: '0.0.1'
        }
    }).then(() => {
        console.log('done!');
    });
}
svg2fonts();