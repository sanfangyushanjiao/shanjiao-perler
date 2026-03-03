/**
 * 下载 CSV 模板文件
 *
 * 提供标准的 CSV 格式模板供用户参考
 */
export function downloadCSVTemplate(): void {
  const template = `x,y,color,code
0,0,#FF6B9D,A01
0,1,#4ECDC4,B12
0,2,#FFE66D,C23
1,0,#FF6B9D,A01
1,1,#FFFFFF,W01
1,2,#000000,K01
2,0,#4ECDC4,B12
2,1,#FFE66D,C23
2,2,#FF6B9D,A01`;

  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'perler-beads-template.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}
