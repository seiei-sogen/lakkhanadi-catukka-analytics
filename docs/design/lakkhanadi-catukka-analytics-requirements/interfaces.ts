/**
 * lakkhanadi-catukka-analytics-requirements 型定義
 *
 * 作成日: 2026-05-06
 * 関連設計: architecture.md / dataflow.md / design-interview.md
 *
 * 対象範囲:
 * - 補助 TypeScript スクリプト `skills/lakkhanadi-catukka/scripts/normalize.ts` の公開 API
 * - LLM-as-judge プロンプト `skills/lakkhanadi-catukka/tests/judge/SKILL_JUDGE.md` の構造化出力
 * - SKILL.md 本体が概念的に扱う長さモード・四相セクション・分析出力
 *
 * 信頼性レベル:
 * - 🔵 青信号: EARS要件定義書・設計文書・ユーザヒアリングを参考にした確実な型定義
 * - 🟡 黄信号: EARS要件定義書・設計文書・ユーザヒアリングから妥当な推測による型定義
 * - 🔴 赤信号: EARS要件定義書・設計文書・ユーザヒアリングにない推測による型定義
 *
 * 備考:
 * - 本プロジェクトは Markdown プロンプト主体の Skill であり、ランタイム上の TS 実装は補助 normalize.ts と
 *   judge プロンプト出力の型表現に限定される (REQ-403)。
 * - SKILL.md 本体および LLM 出力 Markdown は型付けせず、type-only な「概念モデル」として共有する。
 */

// ============================================================
// 1. 共通: 四相セクション識別子
// ============================================================

/**
 * 四相のパーリ語識別子
 * 🔵 信頼性: PRD「目的」/ lakkhanadi-catukka-example.ncl 構造化リファレンス / REQ-001 より
 */
export type FourPhaseKey =
  | 'lakkhana'        // 特相 (lakkhaṇa)
  | 'rasa'            // 作用 (rasa)
  | 'paccupatthana'   // 現れ方 (paccupaṭṭhāna)
  | 'padatthana';     // 近因 (padaṭṭhāna)

/**
 * 四相の現代語ラベル
 * 🔵 信頼性: PRD「出力形式 - 要約表」/ REQ-003 より
 */
export const FOUR_PHASE_LABELS: Record<FourPhaseKey, { pali: string; ja: string }> = {
  lakkhana:      { pali: 'lakkhaṇa',      ja: '特相' },
  rasa:          { pali: 'rasa',          ja: '作用' },
  paccupatthana: { pali: 'paccupaṭṭhāna', ja: '現れ方' },
  padatthana:    { pali: 'padaṭṭhāna',    ja: '近因' },
};

// ============================================================
// 2. 長さモード (REQ-101〜103, EDGE-101)
// ============================================================

/**
 * 長さモード列挙
 * 🔵 信頼性: REQ-101〜103・PRD「出力の長さ」より
 */
export type LengthMode = 'short' | 'normal' | 'detailed';

/**
 * 各モードの詳説セクション目標文数
 * 🔵 信頼性: REQ-004, REQ-101, REQ-102, EDGE-101 より
 *
 * - short:    1〜2 文 (詳説省略または圧縮)
 * - normal:   3〜5 文
 * - detailed: 5〜8 文
 *
 * EDGE-101「詳説は最小 3 文 / 最大 8 文」と short モードは構造的に競合するため、
 * short の場合は要約表のみ完全 + 詳説省略を許容する (dataflow.md フロー 3 備考)。
 */
export const LENGTH_MODE_SENTENCE_RANGE: Record<LengthMode, { min: number; max: number }> = {
  short:    { min: 1, max: 2 },
  normal:   { min: 3, max: 5 },
  detailed: { min: 5, max: 8 },
};

// ============================================================
// 3. Pali 表記正規化 (補助 TypeScript スクリプト)
// ============================================================

/**
 * normalize.ts の公開関数シグネチャ
 * 🔵 信頼性: 設計ヒアリング Q5「単純関数 (推奨)」より
 *
 * 既知異形 (REQ-107) と IAST／ダイアクリティカル揺れ (REQ-108) を標準表記に変換し、
 * 正規化済み文字列を返す。
 *
 * 振る舞い:
 * - 既知異形 (padahāna → padaṭṭhāna 等) と IAST 揺れ (lakkhana → lakkhaṇa 等) はそのまま置換する
 * - 既知異形リスト・IAST 揺れに該当しない極端な崩れ ("padaaaaana" 等) はそのまま通し、
 *   下流の SKILL.md (LLM) 側で "unknown_term" として扱わせる
 *   (設計ヒアリング Q6「スルーして LLM に委ねる」)
 *
 * 例:
 *   normalize('padahāna について教えて')
 *     // => 'padaṭṭhāna について教えて'
 *   normalize('padaaaaana')
 *     // => 'padaaaaana' (崩れすぎているため変換されず、SKILL.md が unknown 扱い)
 */
export type Normalize = (input: string) => string;

/**
 * Pali 用語の正規化規則
 * 🔵 信頼性: REQ-107 (既知異形) / REQ-108 (IAST 揺れ) / dataflow.md フロー 5 より
 *
 * 各エントリの優先順位は配列順 (前のものから先に適用)。
 * `from` は大文字小文字を区別しないマッチを行うことを推奨 (実装時に確定)。
 */
export interface PaliNormalizationRule {
  /** 入力中に出現しうる異形 (例: 'padahāna', 'paccupatthana', 'lakkhana') */
  from: string;
  /** 標準表記 (例: 'padaṭṭhāna', 'paccupaṭṭhāna', 'lakkhaṇa') */
  to: string;
  /** 規則カテゴリ — judge / デバッグ用途のメタ情報 🟡 *メタ情報のため妥当な推測* */
  category: 'known-variant' | 'iast-diacritic';
  /** 由来コメント (PRD・要件定義の参照、例: 'REQ-107', 'TC-NORM-01') */
  source: string;
}

// ============================================================
// 4. 入力種別判定 (Skill 本体プロンプトの内部状態)
// ============================================================

/**
 * 入力種別 — SKILL.md 内で LLM が判定する入力カテゴリ
 * 🔵 信頼性: EDGE-001〜004・dataflow.md「エラーハンドリングフロー」より
 *
 * これは TS で扱う実体ではなく、プロンプトの分岐を概念モデルとして共有するための型。
 */
export type InputClassification =
  | 'empty'           // EDGE-001: 空入力 → 促し
  | 'gibberish'       // EDGE-002: 意味不明文字列 → 言い換えを促す
  | 'over-context'    // EDGE-003: 超長文 → 要点要約を促す/N文字打ち切り
  | 'multi-target'    // EDGE-004: 複数対象 → 中心 1 対象を選定
  | 'normal';         // 正常入力 → 通常フロー

/**
 * 安全性判定 — REQ-106 警告フローへの分岐ラベル
 * 🔵 信頼性: REQ-106・REQ-405〜407・dataflow.md フロー 6 より
 */
export type SafetyClassification =
  | 'medical'         // 医療診断要求
  | 'legal'           // 法律的断定要求
  | 'religious'       // 宗教的断定要求
  | 'others-eval'     // 他者評価・人格判定要求
  | 'normal';         // 警告不要

/**
 * 古典 vs 応用判定 — 応用的分析マーカー付与の分岐
 * 🔵 信頼性: REQ-104, REQ-105・設計ヒアリング Q2「LLM の判断のみ」より
 */
export type CanonicalityClassification =
  | 'canonical'       // 古典明示トピック → マーカーなし (REQ-104)
  | 'applied';        // 非古典トピック → 「四相分析の枠組みを応用すると」付与 (REQ-105)

// ============================================================
// 5. 四相分析出力 (概念モデル / Discriminated Union)
// ============================================================

/**
 * 要約表の 1 行 (REQ-003: 4 行 × 3 列)
 * 🔵 信頼性: REQ-003・PRD「四相分析・要約」より
 */
export interface SummaryRow {
  phase: FourPhaseKey;
  /** パーリ語列 (例: 'lakkhaṇa') */
  pali: string;
  /** 要約列 (一文) */
  summary: string;
}

/**
 * 詳説 1 セクション
 * 🔵 信頼性: REQ-004, REQ-005・PRD「納得感を出すための書き方」より
 */
export interface DetailSection {
  phase: FourPhaseKey;
  /** 文単位に分割した本文 (length は LengthMode により制約される) */
  sentences: string[];
  /** 含まれる具体例の数 (REQ-005 で必須なので最低 1) 🟡 *メタ情報の妥当な推測* */
  exampleCount: number;
}

/**
 * 警告ブロック (REQ-106 / REQ-201 適用時のみ存在)
 * 🔵 信頼性: REQ-106, REQ-201, REQ-405・dataflow.md フロー 6 より
 */
export interface SafetyAdvisory {
  category: SafetyClassification;
  /** 「医療・法律・宗教の権威としては断定しない」旨の本文 */
  message: string;
  /** 専門家相談促進 (REQ-201) を含むか 🔵 *REQ-201 より* */
  recommendsExpertConsultation: boolean;
}

/**
 * 四相分析の共通骨格
 * 🔵 信頼性: REQ-001〜010・PRD「出力形式」より
 */
interface AnalysisBase {
  /** 対象の言い換え (一文) — REQ-002 */
  subjectRestatement: string;
  /** 要約表 (4 行) — REQ-003 */
  summaryTable: SummaryRow[];
  /** 詳説 4 セクション — REQ-004, REQ-005 */
  details: DetailSection[];
  /** 一言まとめ — REQ-010 */
  closingSummary: string;
  /** 古典 vs 応用 — REQ-104, REQ-105 */
  canonicality: CanonicalityClassification;
  /** 応用マーカー本文 (canonicality === 'applied' の時のみ) */
  appliedMarker?: string;
  /** 警告 (safety !== 'normal' の時のみ) — REQ-106 */
  advisory?: SafetyAdvisory;
}

/**
 * 短縮モード出力 — 詳説は省略または 1〜2 文
 * 🔵 信頼性: REQ-101・dataflow.md フロー 3 より
 */
export interface ShortAnalysisOutput extends AnalysisBase {
  mode: 'short';
  /** 短縮モードでは詳説を省略してもよい (要約表 + まとめのみで成立) */
  details: DetailSection[];  // 0 件 (省略) または 4 件 (各 1〜2 文)
}

/**
 * 通常モード出力 — 各詳説 3〜5 文
 * 🔵 信頼性: REQ-103, REQ-004 より
 */
export interface NormalAnalysisOutput extends AnalysisBase {
  mode: 'normal';
  details: DetailSection[];  // 4 件 (各 3〜5 文)
}

/**
 * 詳細モード出力 — 各詳説 5〜8 文
 * 🔵 信頼性: REQ-102, EDGE-101 より
 */
export interface DetailedAnalysisOutput extends AnalysisBase {
  mode: 'detailed';
  details: DetailSection[];  // 4 件 (各 5〜8 文)
}

/**
 * 四相分析出力の Discriminated Union
 * 🔵 信頼性: 設計ヒアリング Q8「Discriminated Union (推奨)」より
 *
 * `mode` フィールドで型を判別する。各モード固有の制約 (詳説文数等) は LENGTH_MODE_SENTENCE_RANGE と
 * 各サブ型の details コメントで表現する。
 *
 * これは LLM 出力 Markdown を概念的に表す型であり、ランタイムでの厳密なシリアライズ／デシリアライズは
 * 設計対象外 (Skill は Markdown 文字列のみを返す)。
 */
export type AnalysisOutput =
  | ShortAnalysisOutput
  | NormalAnalysisOutput
  | DetailedAnalysisOutput;

// ============================================================
// 6. LLM-as-judge 構造化出力
// ============================================================

/**
 * judge が判定する 8 観点
 * 🔵 信頼性: 設計ヒアリング Q4 (8 観点) / NFR-302 / acceptance-criteria.md より
 */
export type JudgeAspect =
  | 'four-sections-coverage'   // 1. 4 セクション網羅
  | 'detail-sentence-count'    // 2. 詳説文数 (モード別)
  | 'concrete-examples'        // 3. 具体例の有無 (REQ-005)
  | 'modern-paraphrase'        // 4. パーリ語の現代語併記 (REQ-006, NFR-202)
  | 'observational-tone'       // 5. 観察的トーン (NFR-203, REQ-009)
  | 'applied-marker'           // 6. 応用マーカーの適否 (REQ-104, 105)
  | 'summary-table-rows'       // 7. 要約表 4 行構造 (REQ-003)
  | 'safety-advisory';         // 8. 警告 + 観察的捉え直し (REQ-106)

/**
 * 1 観点の判定結果
 * 🔵 信頼性: 設計ヒアリング Q7「JSON 構造化出力 (推奨)」より
 */
export interface JudgeAspectResult {
  aspect: JudgeAspect;
  /** pass = 違反なし, fail = 違反あり, n/a = 当該観点が適用外 (例: safety で通常入力) */
  verdict: 'pass' | 'fail' | 'n/a';
  /** 判定理由 (fail / n/a 時は必須、pass 時は任意) — judge プロンプトで簡潔に */
  reason?: string;
  /** 関連要件 ID (REQ-XXX, NFR-XXX) のリスト 🟡 *メタ情報の妥当な推測* */
  relatedRequirements?: string[];
}

/**
 * judge プロンプトの最終出力 (JSON)
 * 🔵 信頼性: 設計ヒアリング Q7・NFR-302・acceptance-criteria.md TC-NFR-302-* より
 *
 * judge プロンプト本文は `skills/lakkhanadi-catukka/tests/judge/SKILL_JUDGE.md` に置く。
 * 出力は本型と互換な JSON ブロックで囲む形式 (実装フェーズで Markdown コードブロックの慣例を確定)。
 */
export interface JudgeReport {
  /** 評価対象サンプル ID (tests/samples/*.md のファイル名 stem 等) */
  sampleId: string;
  /** 期待モード (short/normal/detailed) — 入力サンプル側に記述 */
  expectedMode: LengthMode;
  /** 8 観点の判定結果 */
  aspects: JudgeAspectResult[];
  /** 全観点 pass のとき true (n/a は pass と同等に扱う) */
  overallPass: boolean;
  /** 違反観点数 (集計用) */
  failureCount: number;
  /** judge プロンプト実行時刻 (ISO 8601) 🟡 *メタ情報の妥当な推測* */
  judgedAt?: string;
}

// ============================================================
// 7. 信頼性レベルサマリー
// ============================================================
/**
 * 型定義件数: 約 22 件 (型 / 定数 / インターフェース)
 *
 * - 🔵 青信号: 約 19 件 (86%)
 *   - 全主要型は要件定義・受け入れ基準・設計ヒアリング (Q5〜Q8) のいずれかに直接根拠を持つ
 * - 🟡 黄信号: 約 3 件 (14%)
 *   - メタ情報フィールド (category, exampleCount, judgedAt, relatedRequirements) は
 *     判定・デバッグ用途として妥当な推測で追加した
 * - 🔴 赤信号: 0 件 (0%)
 *
 * 品質評価: 高品質 (要件定義・設計ヒアリングと 1:1 対応)
 */
