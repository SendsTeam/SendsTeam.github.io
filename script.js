document.addEventListener('DOMContentLoaded', () =>{
    const grid = document.querySelector('.grid');
    const size = 4;
    let board = [];
    let currentScore = 0;
    const currentScoreElem = document.getElementById('current-score');

    // 从local storage中获得最高分；如果不存在就设成0
    let highScore = localStorage.getItem('2048-highScore') || 0;
    const highScoreElem = document.getElementById('high-score');
    highScoreElem.textContent = highScore;

    const gameOverElem = document.getElementById('game-over');

    // 更新分数的函数
    function updateScore(value){
        currentScore += value;
        currentScoreElem.textContent = currentScore;
        if (currentScore > highScore){
            highScore = currentScore;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore', highScore);
        }
    }

    // 重新开始游戏的函数
    function restartGame(){
        currentScore = 0;
        currentScoreElem.textContent = '0';
        gameOverElem.style.display = 'none';
        initializeGame();
    }

    // 初始化游戏的函数
    function initializeGame(){
        board = [...Array(size)].map(e => Array(size).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    // 渲染棋盘的函数
    function renderBoard(){
        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = cell.dataset.value;
                const currentValue = board[i][j];
                if (currentValue !== 0){
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    // 动画效果处理
                    if (currentValue !== parseInt(prevValue) && !cell.classList.contains('new-tile')){
                        cell.classList.add('merged-tile');
                    }
                }else{
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }
            }
        }

        // 清除动画类
        setTimeout(() =>{
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell => {
                cell.classList.remove('merged-tile', 'new-tile');
            });
        }, 300);
    }
    
    // 随机放置方块的函数
    function placeRandom(){
        const available = [];
        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                if (board[i][j] === 0){
                    available.push({x: i, y: j});
                }
            }
        }

        if (available.length > 0){
            const randomCell = available[Math.floor(Math.random() * available.length)];
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new-tile'); // 生成新方块的动画
        }
    }

    // 基于键盘方向键移动方块
    function move(direction){
        let hasChanged = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown'){
            for (let j = 0; j < size; j++){
                const column = [...Array(size)].map((_, i) => board[i] [j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for (let i = 0; i < size; i++){
                    if (board[i][j] !== newColumn[i]){
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
        }else if (direction === 'ArrowLeft' || direction === 'ArrowRight'){
            for (let i = 0; i < size; i++){
                const row = board[i];
                const newRow = transform(row, direction === 'ArrowLeft');
                if (row.join(',') !== newRow.join(',')){
                    hasChanged = true;
                    board[i] = newRow;
                }
            }
        }
        if (hasChanged){
            placeRandom();
            renderBoard();
            checkGameOver();
        }
    }

    function transform(line, moveTowardsStart){
        let newLine = line.filter(cell => cell !== 0);
        if (!moveTowardsStart){
            newLine.reverse();
        }
        for (let i = 0;i < newLine.length -1; i++){
            if (newLine[i] === newLine[i + 1]){
                newLine[i] *= 2;
                updateScore(newLine[i]);
                newLine.splice(i + 1, 1);
            }
        }
        while (newLine.length < size){
            newLine.push(0);
        }
        if(!moveTowardsStart){
            newLine.reverse();
        }
        return newLine;
    }

    // 检查游戏是否结束的函数
    function checkGameOver(){
        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                if (board[i][j] === 0){
                    return; // 有空位，游戏肯定没结束
                }
                if (j < size - 1 && board[i][j] === board[i][j + 1]){ 
                // 判断j < size - 1, 如果不满足则 && 之后的检查不会执行，防止数组越界报错
                    return; // 横向有相邻且值相同可加的方块
                }
                if (i < size - 1 && board[i][j] === board [i + 1][j]){
                    return; // 纵向有相邻且值相同可加的方块
                }
            }
        }

        gameOverElem.style.display = 'flex';
    }

    // 监听事件
    document.addEventListener('keydown', event =>{
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)){
            move(event.key);
        }
    });
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    initializeGame();

});