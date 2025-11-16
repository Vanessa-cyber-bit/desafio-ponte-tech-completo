-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tarefa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(100) NOT NULL,
    `descricao` TEXT NOT NULL,
    `status` ENUM('Pendente', 'Em_Progresso', 'Concluida') NOT NULL DEFAULT 'Pendente',
    `prioridade` ENUM('Baixa', 'Media', 'Alta') NOT NULL DEFAULT 'Media',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `criador_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tarefa` ADD CONSTRAINT `Tarefa_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
