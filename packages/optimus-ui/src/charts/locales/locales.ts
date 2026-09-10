/**
 * The shipped language catalogues.
 *
 * A separate entry point on purpose: fourteen languages is a lot of strings, and an application
 * that only needs German should not carry the other thirteen. Importing one and registering it is
 * what puts it in the bundle.
 *
 * English is not here -- it is built into the chart, because a chart with no catalogue registered
 * still has to be able to describe itself.
 *
 * Every catalogue except English is machine-drafted and has not been reviewed by a native speaker.
 * `zh` covers Simplified Chinese. The Italian catalogue exports `it`, which collides with the `it`
 * of Vitest, Jest and Mocha, so rename it at the import site inside a spec file.
 */
import type { ChartText } from '@openng/optimus-ui/types/charts';

/** Arabic. */
export const ar: Partial<ChartText> = {
    chart: 'مخطط',
    exportMenu: 'تصدير المخطط',
    downloadPNG: 'تنزيل PNG',
    downloadJPEG: 'تنزيل JPEG',
    downloadSVG: 'تنزيل SVG',
    downloadPDF: 'تنزيل PDF',
    downloadPNGTransparent: 'تنزيل PNG (شفاف)',
    downloadSVGTransparent: 'تنزيل SVG (شفاف)',
    downloadCSV: 'تنزيل CSV',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    panLeft: 'تحريك لليسار',
    panRight: 'تحريك لليمين',
    resetZoom: 'إعادة تعيين التكبير',
    navigator: 'متصفح المخطط',
    dataTable: 'بيانات المخطط',
    category: 'الفئة',
    value: 'القيمة',
    series: 'السلسلة',
    keyboardHint: 'استخدم مفاتيح الأسهم للتنقل بين نقاط البيانات.',
    all: 'الكل'
};

/** German. */
export const de: Partial<ChartText> = {
    chart: 'Diagramm',
    exportMenu: 'Diagramm exportieren',
    downloadPNG: 'PNG herunterladen',
    downloadJPEG: 'JPEG herunterladen',
    downloadSVG: 'SVG herunterladen',
    downloadPDF: 'PDF herunterladen',
    downloadPNGTransparent: 'PNG herunterladen (transparent)',
    downloadSVGTransparent: 'SVG herunterladen (transparent)',
    downloadCSV: 'CSV herunterladen',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    panLeft: 'Nach links verschieben',
    panRight: 'Nach rechts verschieben',
    resetZoom: 'Ansicht zurücksetzen',
    navigator: 'Diagrammnavigator',
    dataTable: 'Diagrammdaten',
    category: 'Kategorie',
    value: 'Wert',
    series: 'Datenreihe',
    keyboardHint: 'Verwenden Sie die Pfeiltasten, um zwischen den Datenpunkten zu wechseln.',
    all: 'Alle'
};

/** Spanish. */
export const es: Partial<ChartText> = {
    chart: 'Gráfico',
    exportMenu: 'Exportar gráfico',
    downloadPNG: 'Descargar PNG',
    downloadJPEG: 'Descargar JPEG',
    downloadSVG: 'Descargar SVG',
    downloadPDF: 'Descargar PDF',
    downloadPNGTransparent: 'Descargar PNG (transparente)',
    downloadSVGTransparent: 'Descargar SVG (transparente)',
    downloadCSV: 'Descargar CSV',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    panLeft: 'Desplazar a la izquierda',
    panRight: 'Desplazar a la derecha',
    resetZoom: 'Restablecer zoom',
    navigator: 'Navegador del gráfico',
    dataTable: 'Datos del gráfico',
    category: 'Categoría',
    value: 'Valor',
    series: 'Serie',
    keyboardHint: 'Usa las flechas del teclado para moverte entre los puntos de datos.',
    all: 'Todo'
};

/** French. */
export const fr: Partial<ChartText> = {
    chart: 'Graphique',
    exportMenu: 'Exporter le graphique',
    downloadPNG: 'Télécharger PNG',
    downloadJPEG: 'Télécharger JPEG',
    downloadSVG: 'Télécharger SVG',
    downloadPDF: 'Télécharger PDF',
    downloadPNGTransparent: 'Télécharger PNG (transparent)',
    downloadSVGTransparent: 'Télécharger SVG (transparent)',
    downloadCSV: 'Télécharger CSV',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    panLeft: 'Déplacer à gauche',
    panRight: 'Déplacer à droite',
    resetZoom: 'Réinitialiser le zoom',
    navigator: 'Navigateur du graphique',
    dataTable: 'Données du graphique',
    category: 'Catégorie',
    value: 'Valeur',
    series: 'Série',
    keyboardHint: 'Utilisez les touches fléchées pour naviguer entre les points de données.',
    all: 'Tout'
};

/** Hebrew. */
export const he: Partial<ChartText> = {
    chart: 'תרשים',
    exportMenu: 'ייצוא תרשים',
    downloadPNG: 'הורדת PNG',
    downloadJPEG: 'הורדת JPEG',
    downloadSVG: 'הורדת SVG',
    downloadPDF: 'הורדת PDF',
    downloadPNGTransparent: 'הורדת PNG (שקוף)',
    downloadSVGTransparent: 'הורדת SVG (שקוף)',
    downloadCSV: 'הורדת CSV',
    zoomIn: 'התקרבות',
    zoomOut: 'התרחקות',
    panLeft: 'הזזה שמאלה',
    panRight: 'הזזה ימינה',
    resetZoom: 'איפוס התקריב',
    navigator: 'נווט התרשים',
    dataTable: 'נתוני התרשים',
    category: 'קטגוריה',
    value: 'ערך',
    series: 'סדרה',
    keyboardHint: 'השתמשו במקשי החצים כדי לנוע בין נקודות הנתונים.',
    all: 'הכול'
};

/** Italian. Exported as `it`, which collides with the `it` of Vitest, Jest and Mocha. */
export const it: Partial<ChartText> = {
    chart: 'Grafico',
    exportMenu: 'Esporta grafico',
    downloadPNG: 'Scarica PNG',
    downloadJPEG: 'Scarica JPEG',
    downloadSVG: 'Scarica SVG',
    downloadPDF: 'Scarica PDF',
    downloadPNGTransparent: 'Scarica PNG (trasparente)',
    downloadSVGTransparent: 'Scarica SVG (trasparente)',
    downloadCSV: 'Scarica CSV',
    zoomIn: 'Ingrandisci',
    zoomOut: 'Riduci',
    panLeft: 'Sposta a sinistra',
    panRight: 'Sposta a destra',
    resetZoom: 'Reimposta zoom',
    navigator: 'Navigatore del grafico',
    dataTable: 'Dati del grafico',
    category: 'Categoria',
    value: 'Valore',
    series: 'Serie',
    keyboardHint: 'Usa i tasti freccia per spostarti tra i punti dati.',
    all: 'Tutto'
};

/** Japanese. */
export const ja: Partial<ChartText> = {
    chart: 'グラフ',
    exportMenu: 'グラフをエクスポート',
    downloadPNG: 'PNG をダウンロード',
    downloadJPEG: 'JPEG をダウンロード',
    downloadSVG: 'SVG をダウンロード',
    downloadPDF: 'PDF をダウンロード',
    downloadPNGTransparent: 'PNG をダウンロード（透過）',
    downloadSVGTransparent: 'SVG をダウンロード（透過）',
    downloadCSV: 'CSV をダウンロード',
    zoomIn: '拡大',
    zoomOut: '縮小',
    panLeft: '左へ移動',
    panRight: '右へ移動',
    resetZoom: 'ズームをリセット',
    navigator: 'グラフナビゲーター',
    dataTable: 'グラフのデータ',
    category: 'カテゴリー',
    value: '値',
    series: '系列',
    keyboardHint: '矢印キーでデータポイント間を移動できます。',
    all: 'すべて'
};

/** Korean. */
export const ko: Partial<ChartText> = {
    chart: '차트',
    exportMenu: '차트 내보내기',
    downloadPNG: 'PNG 다운로드',
    downloadJPEG: 'JPEG 다운로드',
    downloadSVG: 'SVG 다운로드',
    downloadPDF: 'PDF 다운로드',
    downloadPNGTransparent: 'PNG 다운로드(투명)',
    downloadSVGTransparent: 'SVG 다운로드(투명)',
    downloadCSV: 'CSV 다운로드',
    zoomIn: '확대',
    zoomOut: '축소',
    panLeft: '왼쪽으로 이동',
    panRight: '오른쪽으로 이동',
    resetZoom: '확대 초기화',
    navigator: '차트 내비게이터',
    dataTable: '차트 데이터',
    category: '범주',
    value: '값',
    series: '계열',
    keyboardHint: '화살표 키로 데이터 요소 사이를 이동합니다.',
    all: '전체'
};

/** Dutch. */
export const nl: Partial<ChartText> = {
    chart: 'Diagram',
    exportMenu: 'Diagram exporteren',
    downloadPNG: 'PNG downloaden',
    downloadJPEG: 'JPEG downloaden',
    downloadSVG: 'SVG downloaden',
    downloadPDF: 'PDF downloaden',
    downloadPNGTransparent: 'PNG downloaden (transparant)',
    downloadSVGTransparent: 'SVG downloaden (transparant)',
    downloadCSV: 'CSV downloaden',
    zoomIn: 'Inzoomen',
    zoomOut: 'Uitzoomen',
    panLeft: 'Naar links schuiven',
    panRight: 'Naar rechts schuiven',
    resetZoom: 'Zoom herstellen',
    navigator: 'Diagramnavigator',
    dataTable: 'Diagramgegevens',
    category: 'Categorie',
    value: 'Waarde',
    series: 'Reeks',
    keyboardHint: 'Gebruik de pijltoetsen om tussen de gegevenspunten te navigeren.',
    all: 'Alles'
};

/** Polish. */
export const pl: Partial<ChartText> = {
    chart: 'Wykres',
    exportMenu: 'Eksportuj wykres',
    downloadPNG: 'Pobierz PNG',
    downloadJPEG: 'Pobierz JPEG',
    downloadSVG: 'Pobierz SVG',
    downloadPDF: 'Pobierz PDF',
    downloadPNGTransparent: 'Pobierz PNG (przezroczysty)',
    downloadSVGTransparent: 'Pobierz SVG (przezroczysty)',
    downloadCSV: 'Pobierz CSV',
    zoomIn: 'Powiększ',
    zoomOut: 'Pomniejsz',
    panLeft: 'Przesuń w lewo',
    panRight: 'Przesuń w prawo',
    resetZoom: 'Resetuj powiększenie',
    navigator: 'Nawigator wykresu',
    dataTable: 'Dane wykresu',
    category: 'Kategoria',
    value: 'Wartość',
    series: 'Seria',
    keyboardHint: 'Użyj klawiszy strzałek, aby przechodzić między punktami danych.',
    all: 'Wszystko'
};

/** Portuguese. */
export const pt: Partial<ChartText> = {
    chart: 'Gráfico',
    exportMenu: 'Exportar gráfico',
    downloadPNG: 'Baixar PNG',
    downloadJPEG: 'Baixar JPEG',
    downloadSVG: 'Baixar SVG',
    downloadPDF: 'Baixar PDF',
    downloadPNGTransparent: 'Baixar PNG (transparente)',
    downloadSVGTransparent: 'Baixar SVG (transparente)',
    downloadCSV: 'Baixar CSV',
    zoomIn: 'Ampliar',
    zoomOut: 'Reduzir',
    panLeft: 'Mover para a esquerda',
    panRight: 'Mover para a direita',
    resetZoom: 'Redefinir zoom',
    navigator: 'Navegador do gráfico',
    dataTable: 'Dados do gráfico',
    category: 'Categoria',
    value: 'Valor',
    series: 'Série',
    keyboardHint: 'Use as teclas de seta para navegar entre os pontos de dados.',
    all: 'Tudo'
};

/** Russian. */
export const ru: Partial<ChartText> = {
    chart: 'Диаграмма',
    exportMenu: 'Экспорт диаграммы',
    downloadPNG: 'Скачать PNG',
    downloadJPEG: 'Скачать JPEG',
    downloadSVG: 'Скачать SVG',
    downloadPDF: 'Скачать PDF',
    downloadPNGTransparent: 'Скачать PNG (прозрачный)',
    downloadSVGTransparent: 'Скачать SVG (прозрачный)',
    downloadCSV: 'Скачать CSV',
    zoomIn: 'Приблизить',
    zoomOut: 'Отдалить',
    panLeft: 'Сдвинуть влево',
    panRight: 'Сдвинуть вправо',
    resetZoom: 'Сбросить масштаб',
    navigator: 'Навигатор диаграммы',
    dataTable: 'Данные диаграммы',
    category: 'Категория',
    value: 'Значение',
    series: 'Ряд',
    keyboardHint: 'Используйте клавиши со стрелками для перехода между точками данных.',
    all: 'Все'
};

/** Turkish. */
export const tr: Partial<ChartText> = {
    chart: 'Grafik',
    exportMenu: 'Grafiği dışa aktar',
    downloadPNG: 'PNG indir',
    downloadJPEG: 'JPEG indir',
    downloadSVG: 'SVG indir',
    downloadPDF: 'PDF indir',
    downloadPNGTransparent: 'PNG indir (saydam)',
    downloadSVGTransparent: 'SVG indir (saydam)',
    downloadCSV: 'CSV indir',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    panLeft: 'Sola kaydır',
    panRight: 'Sağa kaydır',
    resetZoom: 'Yakınlaştırmayı sıfırla',
    navigator: 'Grafik gezgini',
    dataTable: 'Grafik verileri',
    category: 'Kategori',
    value: 'Değer',
    series: 'Seri',
    keyboardHint: 'Veri noktaları arasında gezinmek için ok tuşlarını kullanın.',
    all: 'Tümü'
};

/** Simplified Chinese. */
export const zh: Partial<ChartText> = {
    chart: '图表',
    exportMenu: '导出图表',
    downloadPNG: '下载 PNG',
    downloadJPEG: '下载 JPEG',
    downloadSVG: '下载 SVG',
    downloadPDF: '下载 PDF',
    downloadPNGTransparent: '下载 PNG（透明）',
    downloadSVGTransparent: '下载 SVG（透明）',
    downloadCSV: '下载 CSV',
    zoomIn: '放大',
    zoomOut: '缩小',
    panLeft: '向左平移',
    panRight: '向右平移',
    resetZoom: '重置缩放',
    navigator: '图表导航器',
    dataTable: '图表数据',
    category: '类别',
    value: '数值',
    series: '系列',
    keyboardHint: '使用方向键在数据点之间移动。',
    all: '全部'
};
