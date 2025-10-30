import { describe, expect, test } from 'vitest'
import { TRSectionImportSchema, QuestionImportSchema, splitList, splitChoices, splitAnswerKey } from '@/lib/schemas'

describe('TRSectionImportSchema', () => {
  test('should validate a complete TR section', () => {
    const input = {
      id: 'D001',
      title: 'Quality Management',
      version: '2.0.0',
      question_count: 25,
      disciplines: 'Healthcare, Operations',
      roles: 'Administrator, Manager'
    }
    const result = TRSectionImportSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('D001')
      expect(result.data.question_count).toBe(25)
    }
  })

  test('should fail if id or title are missing', () => {
    const input = { version: '1.0.0', question_count: 10, disciplines: '', roles: '' }
    const result = TRSectionImportSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  test('should accept semicolon-delimited disciplines', () => {
    const input = {
      id: 'D002',
      title: 'Risk',
      version: '1.0',
      question_count: 15,
      disciplines: 'Safety;Compliance',
      roles: ''
    }
    const result = TRSectionImportSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.disciplines).toBe('Safety;Compliance')
    }
  })
})

describe('QuestionImportSchema', () => {
  test('should validate a complete question', () => {
    const input = {
      id: 'Q001',
      locale: 'en',
      type: 'mcq',
      prompt: 'Sample prompt?',
      choices: 'Option A|Option B|Option C',
      answer_key: '0',
      section_tags: 'D001,D002',
      difficulty: 2,
      retired: false
    }
    const result = QuestionImportSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe('Q001')
      expect(result.data.type).toBe('mcq')
    }
  })

  test('should fail if required fields are missing', () => {
    const input = { locale: 'en', prompt: 'test', choices: 'A|B', answer_key: '0' }
    const result = QuestionImportSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  test('should reject invalid question type', () => {
    const input = {
      id: 'Q002',
      locale: 'en',
      type: 'invalid-type',
      prompt: 'test',
      choices: 'A|B',
      answer_key: '0',
      section_tags: '',
      difficulty: 'easy'
    }
    const result = QuestionImportSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

describe('helper functions', () => {
  test('splitList should split comma-separated', () => {
    expect(splitList('a,b,c')).toEqual(['a', 'b', 'c'])
    expect(splitList('a, b , c')).toEqual(['a', 'b', 'c'])
  })

  test('splitChoices should split by |', () => {
    expect(splitChoices('A|B|C')).toEqual(['A', 'B', 'C'])
  })

  test('splitAnswerKey should parse 0-based indices', () => {
    expect(splitAnswerKey('0,2')).toEqual([0, 2])
    expect(splitAnswerKey('1')).toEqual([1])
  })
})
