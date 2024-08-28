import fs from 'fs'
import path from 'path'

import express from 'express'

// Função para salvar a imagem base64 como arquivo
export function saveBase64Image(
  fileName: string,
  base64Image: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Assumindo que a string é puro base64, sem prefixo
    const imageData = Buffer.from(base64Image, 'base64')

    const filePath = path.join(__dirname, '..', '..', 'temp', fileName)

    fs.writeFile(filePath, imageData, (err) => {
      if (err) reject(err)
      else resolve(fileName)
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
