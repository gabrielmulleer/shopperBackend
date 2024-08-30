import fs from 'fs'
import path from 'path'

import express from 'express'

// Função para salvar a imagem base64 como arquivo
export function saveBase64Image(
  fileName: string,
  base64Image: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let base64Data: string

    if (base64Image.includes(';base64,')) {
      // Se a string contém o prefixo, removemos ele
      base64Data = base64Image.split(';base64,').pop() || ''
    } else {
      // Se não contém o prefixo, assumimos que é apenas os dados base64
      base64Data = base64Image
    }

    // Verificação adicional para garantir que temos dados
    if (!base64Data) {
      return reject(new Error('Invalid base64 string'))
    }

    const imageData = Buffer.from(base64Data, 'base64')
    const tempDir = path.join(__dirname, '..', '..', 'temp')
    const filePath = path.join(tempDir, fileName)

    // Verificar se a pasta temp existe, se não, criar
    if (!fs.existsSync(tempDir)) {
      try {
        fs.mkdirSync(tempDir, { recursive: true })
      } catch (err) {
        if (err instanceof Error) {
          return reject(
            new Error(`Failed to create temp directory: ${err.message}`),
          )
        } else {
          return reject(
            new Error(
              'Failed to create temp directory due to an unknown error',
            ),
          )
        }
      }
    }

    fs.writeFile(filePath, imageData, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

// Função para gerar URL temporária
export function generateTempUrl(
  req: express.Request,
  fileName: string,
): string {
  const host = req.get('host')
  const protocol = req.protocol
  return `${protocol}://${host}/temp/${fileName}`
}
4
