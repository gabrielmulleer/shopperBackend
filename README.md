# Shopper Backend Challenge

Este é o projeto de backend desenvolvido como parte do desafio técnico para a Shopper. O objetivo deste projeto é criar um serviço de leitura de imagens para gerenciar o consumo individualizado de água e gás, integrando com a API do Google Gemini para processar imagens de medidores.

## Descrição

O backend foi desenvolvido utilizando Node.js com TypeScript, Mongoose para modelagem de dados com MongoDB, e Axios para a integração com a API externa. O projeto é completamente dockerizado para facilitar o ambiente de desenvolvimento e a implantação.

## Funcionalidades

- Recebe uma imagem em base64 de um medidor e utiliza IA para extrair a leitura do consumo.
- Verifica se já existe uma leitura para o mês corrente.
- Permite confirmação ou correção da leitura feita pela IA.
- Lista todas as leituras realizadas por um determinado cliente.

## Pré-requisitos

Antes de começar, você precisará ter o Docker e Docker Compose instalados em sua máquina. Além disso, é necessário ter o Node.js (versão 14 ou superior) e npm instalados.

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/gabrielmulleer/shopperBackend.git
   cd shopperBackend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie arquivos `.env` e `.env.local` na raiz do projeto baseando-se no `.env.example`. Configure as variáveis de ambiente necessárias para o ambiente de produção e desenvolvimento local, respectivamente:

   - **Para produção (.env):**

     ```
     MONGO_URI=mongodb://mongo:27017/teste_shopper_db
     GEMINI_API_KEY=<YOUR_API_KEY>
     PORT=8080
     ```

   - **Para desenvolvimento local (.env.local):**
     ```
     MONGO_URI=mongodb://localhost:27017/teste_shopper_db
     GEMINI_API_KEY=<YOUR_API_KEY>
     PORT=3000
     ```

   > **Nota:** Certifique-se de substituir `<YOUR_API_KEY>` pela sua chave API real do Google Gemini.

## Configuração

Certifique-se de ter um cluster do MongoDB rodando localmente ou configurado para conexão. O projeto utiliza o Mongoose para conectar e manipular os dados do MongoDB.

## Uso

Para iniciar o servidor de desenvolvimento com hot-reloading, execute:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`.

Ou para iniciar o servidor em produção:

```bash
docker-compose up --build
```

O servidor estará rodando em `http://localhost:8080`.

## Endpoints

### 1. POST /api/measures/upload

Responsável por receber uma imagem em base64 e retornar a medida lida pela API Google Gemini.

**Request Body:**

```json
{
  "image": "base64",
  "customer_code": "string",
  "measure_datetime": "datetime",
  "measure_type": "WATER" ou "GAS"
}
```

**Response:**

- **200** - Operação realizada com sucesso

```json
{
  "image_url": "string",
  "measure_value": "integer",
  "measure_uuid": "string"
}
```

- **400** - Dados inválidos

```json
{
  "error_code": "INVALID_DATA",
  "error_description": "Descrição do erro"
}
```

- **409** - Já existe uma leitura para este tipo no mês atual

```json
{
  "error_code": "DOUBLE_REPORT",
  "error_description": "Leitura do mês já realizada"
}
```

### 2. PATCH /api/measures/confirm

Responsável por confirmar ou corrigir o valor lido pela IA.

**Request Body:**

```json
{
  "measure_uuid": "string",
  "confirmed_value": "integer"
}
```

**Response:**

- **200** - Operação realizada com sucesso

```json
{
  "success": true
}
```

- **400** - Dados inválidos
- **404** - Leitura não encontrada
- **409** - Leitura já confirmada

### 3. GET /api/measures/:customerCode/list

Lista todas as medidas realizadas por um cliente específico.

**Query Parameters:**

- `measure_type` (opcional): Filtra as medidas por tipo (`WATER` ou `GAS`).

**Response:**

- **200** - Operação realizada com sucesso

```json
{
  "customer_code": "string",
  "measures": [
    {
      "measure_uuid": "string",
      "measure_datetime": "datetime",
      "measure_type": "string",
      "has_confirmed": "boolean",
      "image_url": "string"
    }
  ]
}
```

- **400** - Tipo de medida inválido
- **404** - Nenhum registro encontrado
