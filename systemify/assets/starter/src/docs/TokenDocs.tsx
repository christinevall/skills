/**
 * Building blocks for the Foundations pages. Everything is read from
 * src/tokens/tokens.resolved.json (generated from tokens.json), so the docs
 * can never show a value the code does not have.
 */
import tokens from '../tokens/tokens.resolved.json';

type Modes = { base: string; md: string; lg: string };
interface Token {
  key: string;
  cssVar: string;
  tier: 'primitive' | 'semantic' | 'component';
  type: string;
  description?: string;
  alias?: string | null;
  value: unknown;
  responsive?: Modes | null;
  css?: Record<string, string>;
}

const all = tokens as Token[];
const short = (alias?: string | null) => alias?.replace(/^primitive\./, '') ?? '';
/** Shows the real value (rem), with the pixel size at the default 16px browser setting as a muted hint. */
const remValue = (v: string) =>
  v.endsWith('rem') ? (
    <>
      {v} <span style={{ color: 'var(--ds-color-text-muted)' }}>({parseFloat(v) * 16}px at 16px)</span>
    </>
  ) : (
    v
  );

const cell: React.CSSProperties = {
  padding: 'var(--ds-space-xs) var(--ds-space-sm)',
  borderBlockEnd: 'var(--ds-border-width-default) solid var(--ds-color-border-default)',
  verticalAlign: 'top',
  font: 'var(--ds-text-body-sm)',
  fontSize: 'var(--ds-font-size-12)',
  color: 'var(--ds-color-text-default)',
};
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, Menlo, monospace', overflowWrap: 'anywhere' };

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table style={{ inlineSize: '100%', borderCollapse: 'collapse', marginBlock: 'var(--ds-space-md)' }}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} style={{ ...cell, textAlign: 'start', font: 'var(--ds-text-label-md-strong)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

/** Every text style, rendered in itself, with its values per mode. */
export function TextStyles() {
  const styles = all.filter((t) => t.type === 'typography');
  return (
    <Table head={['Text style', 'Default', 'md (800px+)', 'lg (1280px+)', 'In code']}>
      {styles.map((t) => {
        const v = t.value as Record<keyof Modes, Record<string, string | number>>;
        const fmt = (m: keyof Modes) => `${v[m].fontSize} / ${v[m].lineHeight} · ${v[m].letterSpacing}`;
        return (
          <tr key={t.key}>
            <td style={{ ...cell, inlineSize: '40%' }}>
              <span style={{ font: `var(${t.cssVar})`, letterSpacing: `var(${t.cssVar}-letter-spacing)`, display: 'block', color: 'var(--ds-color-text-strong)', textTransform: t.key.endsWith('display') || t.key.endsWith('badge') ? 'uppercase' : 'none' }}>
                {t.key.split('.').at(-1)}
              </span>
              <span style={{ color: 'var(--ds-color-text-muted)' }}>{t.description}</span>
            </td>
            <td style={cell}>{fmt('base')}</td>
            <td style={cell}>{fmt('md')}</td>
            <td style={cell}>{fmt('lg')}</td>
            <td style={{ ...cell, ...mono }}>font: var({t.cssVar})</td>
          </tr>
        );
      })}
    </Table>
  );
}

/** Tokens that change per breakpoint, one column per mode. */
export function ResponsiveTable({ prefix }: { prefix: string }) {
  const list = all.filter((t) => t.key.startsWith(prefix));
  return (
    <Table head={['Token', 'Default', 'md (800px+)', 'lg (1280px+)', 'Use']}>
      {list.map((t) => {
        const m = t.responsive ?? { base: String(t.value), md: String(t.value), lg: String(t.value) };
        return (
          <tr key={t.key}>
            <td style={{ ...cell, ...mono }}>{t.cssVar}</td>
            <td style={cell}>{remValue(m.base)}</td>
            <td style={cell}>{remValue(m.md)}</td>
            <td style={cell}>{remValue(m.lg)}</td>
            <td style={cell}>{t.description}</td>
          </tr>
        );
      })}
    </Table>
  );
}

/** Semantic colours of one group, with a swatch. */
export function ColorTable({ group }: { group: string }) {
  const list = all.filter((t) => t.key.startsWith(`semantic.color.${group}.`));
  return (
    <Table head={['', 'Token', 'Value', 'Use']}>
      {list.map((t) => (
        <tr key={t.key}>
          <td style={cell}>
            <span style={{ display: 'block', inlineSize: 'var(--ds-size-40)', blockSize: 'var(--ds-size-40)', background: `var(${t.cssVar})`, boxShadow: 'inset 0 0 0 1px var(--ds-color-border-default)' }} />
          </td>
          <td style={{ ...cell, ...mono }}>{t.cssVar}</td>
          <td style={cell}>
            {String(t.value)}
            <br />
            <span style={{ color: 'var(--ds-color-text-muted)' }}>{short(t.alias)}</span>
          </td>
          <td style={cell}>{t.description}</td>
        </tr>
      ))}
    </Table>
  );
}

/** Any group of tokens as a plain table. */
export function TokenTable({ prefix }: { prefix: string }) {
  const list = all.filter((t) => t.key.startsWith(prefix) && t.type !== 'typography');
  return (
    <Table head={['Token', 'Value', 'Points to', 'Use']}>
      {list.map((t) => (
        <tr key={t.key}>
          <td style={{ ...cell, ...mono }}>{t.cssVar}</td>
          <td style={cell}>{remValue(String(t.value))}</td>
          <td style={cell}>{short(t.alias)}</td>
          <td style={cell}>{t.description}</td>
        </tr>
      ))}
    </Table>
  );
}

export const tokenCounts = {
  total: all.length,
  primitive: all.filter((t) => t.tier === 'primitive').length,
  semantic: all.filter((t) => t.tier === 'semantic').length,
  component: all.filter((t) => t.tier === 'component').length,
  responsive: all.filter((t) => t.responsive).length,
  textStyles: all.filter((t) => t.type === 'typography').length,
};

export function TokenCounts() {
  return (
    <p>
      <strong>{tokenCounts.total} tokens</strong>: {tokenCounts.primitive} primitive · {tokenCounts.semantic} semantic · {tokenCounts.component} component. {tokenCounts.textStyles} text styles. {tokenCounts.responsive} values change per breakpoint (default, md, lg).
    </p>
  );
}

/** The primitive colour ramps (tier 1), with the measured values marked. */
export function ColorPrimitives() {
  const ramps = [...new Set(all.filter((t) => t.key.startsWith('primitive.color.')).map((t) => t.key.split('.')[2]))];
  return (
    <div style={{ display: 'grid', gap: 'var(--ds-space-lg)', marginBlock: 'var(--ds-space-md)' }}>
      {ramps.map((ramp) => {
        const steps = all.filter((t) => t.key.startsWith(`primitive.color.${ramp}.`));
        return (
          <div key={ramp}>
            <p style={{ font: 'var(--ds-text-label-md-strong)', marginBlockEnd: 'var(--ds-space-xs)' }}>{ramp}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-space-xs)' }}>
              {steps.map((t) => (
                <div key={t.key} style={{ inlineSize: 'var(--ds-size-80)' }} title={t.description ?? ''}>
                  <div style={{ blockSize: 'var(--ds-size-56)', background: `var(${t.cssVar})`, boxShadow: 'inset 0 0 0 1px var(--ds-color-border-default)' }} />
                  <p style={{ ...cell, padding: 'var(--ds-space-2xs) 0', borderBlockEnd: 0 }}>
                    <strong>{t.key.split('.').at(-1)}</strong>
                    {t.description?.startsWith('Measured') ? ' ●' : ''}
                    <br />
                    {String(t.value)}
                    <br />
                    <span style={{ ...mono, color: 'var(--ds-color-text-muted)' }}>{t.cssVar}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <p style={{ ...cell, borderBlockEnd: 0 }}>● measured on the live site. The rest fills the palette for prototypes (form errors, success).</p>
    </div>
  );
}
