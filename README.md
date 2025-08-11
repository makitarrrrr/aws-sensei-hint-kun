# AWS Sensei ヒントくん Chrome拡張機能

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AWS用語のヒントをツールチップで表示するChrome拡張機能です。Webページ上のAWS用語にマウスオーバーすると、詳細な説明をツールチップで表示します。

![AWS Terms Dictionary Demo](https://via.placeholder.com/800x400/f0f0f0/333333?text=Demo+Screenshot)

## 🚀 特徴

- **自動検出**: Webページ上のAWS用語を自動でハイライト表示
- **詳細説明**: マウスオーバーで用語の詳細説明を表示
- **多言語対応**: 日本語・英語の両言語をサポート
- **検索機能**: ポップアップから用語を直接検索
- **カスタマイズ**: ダークモード、文字サイズ調整
- **プライバシー重視**: 個人情報の収集は一切なし

## 📦 インストール

### Chrome Web Storeから（推奨）
1. [Chrome Web Store](https://chrome.google.com/webstore) で「AWS Sensei ヒントくん」を検索
2. 「Chromeに追加」をクリック
3. 拡張機能アイコンをクリックして有効化

### 開発版のインストール
1. このリポジトリをクローンまたはダウンロード
2. Chrome で `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. ダウンロードしたフォルダを選択

## 🎯 対応用語

200以上のAWS用語に対応しています：

**コンピューティング**
- EC2, Lambda, ECS, EKS, Fargate, Batch

**ストレージ**
- S3, EBS, EFS, FSx, Glacier

**データベース**
- RDS, DynamoDB, Aurora, ElastiCache, Redshift

**ネットワーク**
- VPC, CloudFront, Route 53, ALB, NLB, API Gateway

**セキュリティ**
- IAM, Cognito, KMS, WAF, Shield, Security Groups

**管理・ガバナンス**
- CloudWatch, CloudTrail, Control Tower, Guardrails, Account Factory

その他多数...

## 🛠️ 使い方

1. **拡張機能を有効化**
   - 拡張機能アイコンをクリック
   - 「機能を有効化」ボタンを押す

2. **AWS用語を確認**
   - Webページ上のAWS用語が自動でハイライト表示される
   - 用語にマウスオーバーすると詳細説明が表示される

3. **設定のカスタマイズ**
   - 表示言語の切り替え（日本語/英語）
   - 文字サイズの調整
   - テーマの変更（ライト/ダーク/自動）

4. **用語検索**
   - ポップアップの検索ボックスから用語を直接検索
   - オートコンプリート機能で素早く見つけられる

## 🔒 プライバシー

この拡張機能は：
- **個人情報を収集しません**
- **外部サーバーにデータを送信しません**
- **すべての処理はローカルで実行されます**
- **ユーザーの設定のみローカルに保存します**

詳細は[プライバシーポリシー](PRIVACY_POLICY.md)をご確認ください。

## 🤝 貢献

プロジェクトへの貢献を歓迎します！

### バグ報告・機能要望
- [Issues](https://github.com/yourusername/aws-terms-dictionary/issues)でバグ報告や機能要望をお送りください

### 用語の追加・修正
1. `data/aws-terms-ja.json`（日本語）と`data/aws-terms-en.json`（英語）を編集
2. Pull Requestを作成

### 開発に参加
1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

このプロジェクトは[MIT License](LICENSE)の下で公開されています。

## 🙏 謝辞

- AWS用語の説明はAIによって生成されています
- アイコンは[適切なクレジット]から使用

## 📞 サポート

- **バグ報告**: [GitHub Issues](https://github.com/yourusername/aws-terms-dictionary/issues)
- **機能要望**: [GitHub Issues](https://github.com/yourusername/aws-terms-dictionary/issues)
- **質問**: [GitHub Discussions](https://github.com/yourusername/aws-terms-dictionary/discussions)

---

⭐ このプロジェクトが役に立った場合は、スターをつけていただけると嬉しいです！