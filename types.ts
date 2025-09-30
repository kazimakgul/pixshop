/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const FEATURE_TABS = ['retouch', 'crop', 'expand', 'insert', 'adjust', 'filters'] as const;

export type FeatureTab = typeof FEATURE_TABS[number];
