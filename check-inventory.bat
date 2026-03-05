@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════
echo   山椒爱拼豆 - 激活码库存查询
echo ═══════════════════════════════════════════════════════
echo.

call npm run check:codes

echo.
echo ═══════════════════════════════════════════════════════
echo.
echo 补货命令：
echo   npm run gen:codes:24h -- --count 数量
echo   npm run gen:codes:7d -- --count 数量
echo   npm run gen:codes:lifetime -- --count 数量
echo.
echo ═══════════════════════════════════════════════════════
echo.
pause
