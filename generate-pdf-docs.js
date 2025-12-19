const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Список документаційних файлів у порядку включення
const docFiles = [
  { file: 'README.md', title: 'SafeNotes - Огляд проекту' },
  { file: 'technical_specification.md', title: 'Технічна специфікація' },
  { file: 'project_plan.md', title: 'План управління проектом' },
  { file: 'requirements.md', title: 'Функціональні та нефункціональні вимоги' },
  { file: 'roadmap.md', title: 'Дорожня карта розробки' },
  { file: 'backlog.md', title: 'Беклог завдань' },
  { file: 'risk_matrix.md', title: 'Матриця ризиків' },
  { file: 'test_cases.md', title: 'Тест-кейси' },
];

async function generatePDF() {
  console.log('🚀 Початок генерації PDF документації...\n');

  // Створюємо об'єднаний markdown файл
  let combinedMarkdown = `# SafeNotes Platform
## Повна документація проекту

**Дата генерації:** ${new Date().toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}

---

`;

  // Читаємо та об'єднуємо всі файли
  for (const { file, title } of docFiles) {
    const filePath = path.join(__dirname, file);

    if (fs.existsSync(filePath)) {
      console.log(`📄 Додавання: ${file}`);
      const content = fs.readFileSync(filePath, 'utf-8');

      combinedMarkdown += `\n\n---\n\n# ${title}\n\n${content}\n\n`;
    } else {
      console.warn(`⚠️  Файл не знайдено: ${file}`);
    }
  }

  // Зберігаємо об'єднаний markdown
  const tempMdPath = path.join(__dirname, 'FULL_DOCUMENTATION.md');
  fs.writeFileSync(tempMdPath, combinedMarkdown, 'utf-8');
  console.log(`\n✅ Створено об'єднаний markdown: ${tempMdPath}\n`);

  // Перевіряємо наявність pandoc
  try {
    await execPromise('pandoc --version');
    console.log('✅ Pandoc знайдено, використовуємо його для генерації PDF...\n');

    const outputPdf = path.join(__dirname, 'SafeNotes_Documentation.pdf');

    // Генеруємо PDF за допомогою pandoc
    const pandocCommand = `pandoc "${tempMdPath}" -o "${outputPdf}" --pdf-engine=pdflatex -V geometry:margin=1in --toc --toc-depth=2 --highlight-style=tango || pandoc "${tempMdPath}" -o "${outputPdf}" --pdf-engine=wkhtmltopdf --toc --toc-depth=2`;

    try {
      await execPromise(pandocCommand);
      console.log(`✅ PDF успішно згенеровано: ${outputPdf}\n`);
      console.log('📦 Документація готова!');
    } catch (pdfError) {
      console.error('❌ Помилка при генерації PDF через pandoc:', pdfError.message);
      console.log('\n⚠️  Спроба альтернативного методу...\n');
      await generateWithNode(tempMdPath);
    }
  } catch (error) {
    console.log('⚠️  Pandoc не встановлено, використовуємо Node.js підхід...\n');
    await generateWithNode(tempMdPath);
  }
}

async function generateWithNode(mdPath) {
  console.log('🔧 Встановлення необхідних залежностей...\n');

  try {
    // Перевіряємо чи puppeteer вже встановлений в server
    const puppeteerPath = path.join(__dirname, 'server', 'node_modules', 'puppeteer');
    let puppeteer;

    if (fs.existsSync(puppeteerPath)) {
      console.log('✅ Використовуємо Puppeteer з server/node_modules\n');
      puppeteer = require('./server/node_modules/puppeteer');
    } else {
      console.log('📦 Встановлення marked та puppeteer...');
      await execPromise('npm install --no-save marked puppeteer');
      puppeteer = require('puppeteer');
    }

    const marked = require('marked');

    // Читаємо markdown
    const markdown = fs.readFileSync(mdPath, 'utf-8');

    // Конвертуємо в HTML
    const html = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SafeNotes Platform - Документація</title>
    <style>
        @page {
            margin: 2cm;
            size: A4;
        }
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            page-break-before: always;
            margin-top: 40px;
        }
        h1:first-of-type {
            page-break-before: avoid;
            margin-top: 0;
        }
        h2 {
            color: #34495e;
            border-bottom: 2px solid #95a5a6;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        h3 {
            color: #555;
            margin-top: 20px;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        pre {
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            page-break-inside: avoid;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            page-break-inside: avoid;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #3498db;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin-left: 0;
            font-style: italic;
            color: #555;
        }
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
        hr {
            border: none;
            border-top: 2px solid #ecf0f1;
            margin: 30px 0;
        }
        .cover-page {
            text-align: center;
            padding: 100px 0;
            page-break-after: always;
        }
        .cover-page h1 {
            font-size: 3em;
            border: none;
            page-break-before: avoid;
        }
        .cover-page p {
            font-size: 1.2em;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="cover-page">
        <h1>SafeNotes Platform</h1>
        <p>Повна документація проекту</p>
        <p>Дата: ${new Date().toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    ${marked.parse(markdown)}
</body>
</html>
    `;

    // Генеруємо PDF
    console.log('🎨 Генерація PDF через Puppeteer...\n');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const outputPdf = path.join(__dirname, 'SafeNotes_Documentation.pdf');
    await page.pdf({
      path: outputPdf,
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; padding: 0 2cm; text-align: center; color: #999;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    });

    await browser.close();

    console.log(`✅ PDF успішно згенеровано: ${outputPdf}\n`);
    console.log('📦 Документація готова!');

  } catch (error) {
    console.error('❌ Помилка при генерації PDF:', error.message);
    console.log('\n💡 Рекомендація: Встановіть pandoc для кращої генерації PDF:');
    console.log('   macOS:   brew install pandoc');
    console.log('   Ubuntu:  sudo apt-get install pandoc');
    console.log('   Windows: https://pandoc.org/installing.html\n');
  }
}

// Запуск генерації
generatePDF().catch(console.error);
