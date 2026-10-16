import { getSource } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer } from '@zbsearch/tokenizers/mandarin';

// 中文分词：mandarin 词典级 tokenizer（实验性）；默认 multilingual 亦可零配置工作
export const { GET } = createFromSource(getSource, {
  tokenizer: createTokenizer(),
});
