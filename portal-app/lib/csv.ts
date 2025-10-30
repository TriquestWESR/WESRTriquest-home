import { parse } from 'csv-parse/sync'
export function parseCSV(input: string): any[] {
  return parse(input, { columns: true, skip_empty_lines: true, trim: true })
}
