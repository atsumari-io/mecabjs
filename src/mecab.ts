import { exec, execSync } from 'child_process';
import sq from 'shell-quote';

export interface MeCabWordOutput {
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

export interface MeCabOptions {
  maxBuffer: number;
}

export class MeCab {
  command = 'mecab';
  options: MeCabOptions = { maxBuffer: 300 * 1024 * 8 }; // 300kb

  constructor(options?: MeCabOptions) {
    if (options) this.options = options;
  }

  _parseField = (field: string | undefined) =>
    field === undefined || field === '*' ? null : field;

  parser = (wordOutput: (string | undefined)[]): MeCabWordOutput | null =>
    wordOutput.length <= 8
      ? null
      : {
          // Ref: http://mecab.googlecode.com/svn/trunk/mecab/doc/index.html
          // 表層形\t品詞,品詞細分類1,品詞細分類2,品詞細分類3,活用形,活用型,原形,読み,発音
          kanji: this._parseField(wordOutput[0]),
          lexical: this._parseField(wordOutput[1]),
          compound1: this._parseField(wordOutput[2]),
          compound2: this._parseField(wordOutput[3]),
          compound3: this._parseField(wordOutput[4]),
          conjugation: this._parseField(wordOutput[5]),
          inflection: this._parseField(wordOutput[6]),
          original: this._parseField(wordOutput[7]),
          reading: this._parseField(wordOutput[8]),
          pronunciation: this._parseField(wordOutput[9])
        };

  _shellCommand = (str: string) => {
    return sq.quote(['echo', str]) + ' | ' + this.command;
  };

  _parseMeCabResult = (result: string) => {
    return result
      .split('\n')
      .map((line) => {
        const arr = line.split('\t');
        // EOS
        if (arr.length === 1) {
          return [line];
        }
        return [arr[0]].concat(arr[1]?.split(','));
      })
      .map((arr) => this.parser(arr));
  };

  parse = (str: string) => {
    return new Promise<(MeCabWordOutput | null)[]>((resolve, reject) => {
      // for bug
      exec(this._shellCommand(str), this.options, async (err, result) => {
        if (err) {
          return reject(err);
        }

        resolve(this._parseMeCabResult(result.toString()).slice(0, -2));
      });
    });
  };

  parseSync = (str: string) => {
    const result = execSync(this._shellCommand(str), this.options);
    return this._parseMeCabResult(String(result)).slice(0, -2);
  };
}
