# MeCab client for Node.js

MeCab is a morphological analyzer for the Japanese language. This package will allow you to
use MeCab in your Node.js code if you have MeCab installed.

## Installation

```bash
npm install mecabjs
# or
yarn add mecabjs
```

## Usage

```typescript
import { MeCab } from 'mecab-client'

const main = async () => {
  const mecab = new MeCab()

  const result = await mecab.parse("こんにちは")
  console.log(result)
}

main()
```

Output interface for one word:

```typescript
interface MeCabWordOutput {
  kanji: string | null;
  lexical: string | null;
  compound1: string | null;
  compound2: string | null;
  compound3: string | null;
  conjugation: string | null;
  inflection: string | null;
  original: string | null;
  reading: string | null;
  pronunciation: string | null;
}
```
