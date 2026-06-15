controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    projectileSpeed = 100
    // Arma mais forte no nível 2 e 3
    if (currentLevel >= 2) {
        projectileSpeed = 160
    }
    bullet = sprites.createProjectileFromSprite(img`
        . 5 5 . 
        5 5 5 5 
        . 5 5 . 
        `, playerSprite, projectileSpeed, 0)
    // Efeito sonoro
    music.pewPew.play()
})
// Controles: Pulo (Botão A) e Tiro (Botão B)
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    // Permite pular apenas se estiver no "chão" (y >= 100)
    if (playerSprite.y >= 100) {
        playerSprite.vy = -120
        // Efeito sonoro
        music.jumpUp.play()
    }
})
info.onScore(25, function () {
    if (currentLevel == 2) {
        currentLevel = 3
        // Nascem muito rápido
        enemySpawnTime = 800
        game.splash("Nivel 3! Inimigos mais rapidos!")
    }
})
// Progressão de Níveis
info.onScore(10, function () {
    if (currentLevel == 1) {
        currentLevel = 2
        // Nascem mais rápido
        enemySpawnTime = 1200
        game.splash("Nivel 2! Armas melhoradas!")
    }
})
info.onScore(50, function () {
    if (currentLevel == 3) {
        // Mensagem de sucesso ao "zerar" o jogo
        game.gameOver(true)
        game.setGameOverMessage(true, "Parabens! Voce zerou!")
    }
})
// Colisão: Jogador pega a Vida (Coração)
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    otherSprite.destroy()
    info.changeLifeBy
})
// Função para criar inimigos
function spawnEnemy () {
    enemy = sprites.create(img`
        . . . 7 7 7 . . . 
        . . 7 7 7 7 7 . . 
        . . 7 f 7 f 7 . . 
        . . 7 7 7 7 7 . . 
        . . . 7 7 7 . . . 
        `, SpriteKind.Enemy)
    // Nascem do lado direito, no chão
    enemy.setPosition(160, 100)
    enemySpeed = -50
    // Inimigos mais rápidos conforme avança de fase
    if (currentLevel == 2) {
        enemySpeed = -75
    }
    if (currentLevel == 3) {
        enemySpeed = -100
    }
    enemy.vx = enemySpeed
    enemy.setFlag(SpriteFlag.AutoDestroy, true)
}
// Colisão: Tiro acerta o Inimigo
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprite.destroy()
    otherSprite.destroy(effects.fire, 100)
    // Corrigido
    info.changeScoreBy(1)
    music.baDing.play()
    // 10% de chance de dropar vida ao destruir inimigo
    if (Math.percentChance(10)) {
        heart = sprites.create(img`
            . 2 . 2 . 
            2 2 2 2 2 
            2 2 2 2 2 
            . 2 2 2 . 
            . . 2 . . 
            `, SpriteKind.Food)
        heart.setPosition(otherSprite.x, otherSprite.y)
        // Move lentamente para o jogador
        heart.vx = -20
        heart.setFlag(SpriteFlag.AutoDestroy, true)
    }
})
// Colisão: Inimigo acerta o Jogador
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.destroy()
    if (!(isInvincible)) {
        // Corrigido
        info.changeLifeBy(-1)
        music.powerDown.play()
        // Ativa modo indestrutível temporário por 2 segundos
        isInvincible = true
        invincibilityEndTime = game.runtime() + 2000
        sprite.startEffect(effects.blizzard, 2000)
    }
})
let invincibilityEndTime = 0
let isInvincible = false
let heart: Sprite = null
let enemySpeed = 0
let enemy: Sprite = null
let bullet: Sprite = null
let projectileSpeed = 0
let playerSprite: Sprite = null
let enemySpawnTime = 0
let currentLevel = 0
// Configurações Iniciais
currentLevel = 1
enemySpawnTime = 2000
let lastSpawn = game.runtime()
scene.setBackgroundColor(9)
info.setScore(0)
// Jogador tem 3 chances antes do Game Over
info.setLife(3)
// Criando o Jogador
playerSprite = sprites.create(img`
    . . . 2 2 2 . . . 
    . . 2 2 2 2 2 . . 
    . . d d d d d . . 
    . . d f d f d . . 
    . . d d d d d . . 
    . . . 8 8 8 . . . 
    . . 8 8 8 8 8 . . 
    . . 8 . . . 8 . . 
    `, SpriteKind.Player)
playerSprite.setPosition(20, 100)
// Move apenas para os lados
controller.moveSprite(playerSprite, 100, 0)
playerSprite.setStayInScreen(true)
// Música de fundo
music.setVolume(20)
music.playMelody("C D E F G A B C5 ", 120)
// Lógica de Atualização Contínua
game.onUpdate(function () {
    // Gravidade e chão
    playerSprite.vy += 5
    if (playerSprite.y > 100) {
        playerSprite.y = 100
        playerSprite.vy = 0
    }
    // Fim da invencibilidade
    if (isInvincible && game.runtime() > invincibilityEndTime) {
        isInvincible = false
    }
    // Gerador de Inimigos
    if (game.runtime() - lastSpawn > enemySpawnTime) {
        spawnEnemy()
        lastSpawn = game.runtime()
    }
})
