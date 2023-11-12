import fs from 'fs';
import path from 'path';
import { FAILED_IMAGE_TEXT, imageToText } from './imageToText';
import {
  infoLog,
  successLog,
  warnLog,
  errorLog,
  getGitIgnoredDirs,
} from './utils';
import * as cheerio from 'cheerio';

export const run = async (
  startPath: string = process.cwd(),
  includeDir: string | null = null
) => {
  const absoluteStartPath = path.join(startPath, includeDir || '');
  const extensions = ['.html', '.jsx', '.tsx', '.js', '.ts', '.md', '.mdx'];

  const ignoredDirectories = [
    'dist',
    'node_modules',
    'build',
    '.git',
    ...getGitIgnoredDirs(startPath),
  ];

  if (!fs.existsSync(absoluteStartPath)) {
    errorLog(`Specified path ${absoluteStartPath} does not exist.`);
    return;
  }

  const stat = fs.statSync(absoluteStartPath);

  if (
    !stat.isDirectory() &&
    !extensions.includes(path.extname(absoluteStartPath))
  ) {
    warnLog(
      `Specified file ${absoluteStartPath} is not a recognized extension.`
    );
    return;
  }

  if (stat.isDirectory()) {
    await iterateFiles(
      absoluteStartPath,
      extensions,
      includeDir,
      ignoredDirectories
    );
  } else {
    await processFile(absoluteStartPath);
  }
};

const iterateFiles = async (
  dir: string,
  extensions: string[],
  includeDir: string | null = null,
  ignoredDirectories: string[] = []
) => {
  if (!fs.existsSync(dir)) {
    errorLog(`Directory ${dir} does not exist.`);
    return;
  }

  infoLog(`Checking directory: ${dir}`);
  const files = fs.readdirSync(dir);

  if (includeDir && !files.some((file) => file.includes(includeDir))) {
    warnLog(
      `No matching sub-directory or file found for ${includeDir} in ${dir}`
    );
  }

  for (const file of files) {
    if (ignoredDirectories.includes(file)) {
      continue;
    }

    if (includeDir && !file.includes(includeDir)) {
      continue;
    }

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await iterateFiles(filePath, extensions, includeDir, ignoredDirectories);
    } else if (extensions.includes(path.extname(filePath))) {
      await processFile(filePath);
    }
  }
};

const processFile = async (filePath: string) => {
  infoLog(`Processing file: ${filePath}`);

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(fileContent);
  let modified = false;

  const images = $('img').not('[alt]').toArray();

  for (const img of images) {
    const src = $(img).attr('src');
    if (src) {
      const altText = await imageToText(src);
      if (altText !== FAILED_IMAGE_TEXT) {
        $(img).attr('alt', altText);
        modified = true;
      }
    }
  }

  if (modified) {
    const updatedContent = $.html();
    fs.writeFileSync(filePath, updatedContent);
    successLog(`Updated file: ${filePath}`);
  } else {
    infoLog(`No changes made to ${filePath}`);
  }
};
