# AWS用語データ管理

## ファイル構成

- `aws-terms-ja.json`: AWS用語の辞書データ（日本語）
- `aws-terms-en.json`: AWS用語の辞書データ（英語）

## データ形式

### 日本語ファイル (aws-terms-ja.json)
```json
{
  "用語名": {
    "name": "正式名称（日本語）",
    "description": "詳細説明（日本語）",
    "usability": {
      "reviews": [
        "ユーザーレビュー1",
        "ユーザーレビュー2"
      ],
      "pros": ["メリット1", "メリット2"],
      "cons": ["注意点1", "注意点2"]
    }
  }
}
```

### 英語ファイル (aws-terms-en.json)
```json
{
  "TERM_NAME": {
    "name": "Official Name (English)",
    "description": "Detailed description (English)",
    "usability": {
      "reviews": [
        "User review 1",
        "User review 2"
      ],
      "pros": ["Advantage 1", "Advantage 2"],
      "cons": ["Limitation 1", "Limitation 2"]
    }
  }
}
```

## 新しい用語の追加方法

1. **日本語データの追加**: `aws-terms-ja.json`ファイルを開いて新しい用語を追加
2. **英語データの追加**: `aws-terms-en.json`ファイルを開いて対応する英語データを追加
3. **用語名の統一**: 両ファイルで同じ用語名（キー）を使用
4. **構文チェック**: JSONの構文エラーがないか確認

## 用語追加の例

### 日本語ファイルへの追加
```json
{
  "Fargate": {
    "name": "AWS Fargate",
    "description": "コンテナ用のサーバーレスコンピューティングエンジン",
    "usability": {
      "reviews": [
        "サーバー管理が不要で便利",
        "コンテナの実行が簡単"
      ],
      "pros": ["サーバーレス", "簡単な運用"],
      "cons": ["コスト高", "カスタマイズ制限"]
    }
  }
}
```

### 英語ファイルへの追加
```json
{
  "Fargate": {
    "name": "AWS Fargate",
    "description": "Serverless compute engine for containers",
    "usability": {
      "reviews": [
        "No server management required",
        "Easy container execution"
      ],
      "pros": ["Serverless", "Easy operations"],
      "cons": ["Higher cost", "Limited customization"]
    }
  }
}
```

## 使い勝手情報の項目説明

- **reviews**: 実際のユーザーレビュー（配列形式）
- **pros**: メリット・良い点（配列形式）
- **cons**: デメリット・注意点（配列形式）

## ファイル分離のメリット

1. **管理の簡素化**: 言語ごとに独立してデータを管理
2. **翻訳作業の効率化**: 各言語の担当者が独立して作業可能
3. **データの整合性**: 言語固有の表現や文化的な違いに対応
4. **パフォーマンス向上**: 必要な言語のデータのみ読み込み

## 注意事項

- 用語名（キー）は両ファイルで統一する必要があります
- 用語名は大文字小文字を区別しません
- 単語境界で検索されるため、部分一致は検出されません
- JSONファイルの構文エラーがあると拡張機能が正常に動作しません
- 変更後はChrome拡張機能の再読み込みが必要です

## 現在サポートしている用語

### コンピューティング
- EC2 (Elastic Compute Cloud)
- Lambda (AWS Lambda)
- Elastic Beanstalk (AWS Elastic Beanstalk)

### コンテナ
- ECS (Elastic Container Service)
- EKS (Elastic Kubernetes Service)

### データベース
- RDS (Relational Database Service)
- DynamoDB (Amazon DynamoDB)
- ElastiCache (Amazon ElastiCache)
- Redshift (Amazon Redshift)

### ストレージ
- S3 (Simple Storage Service)
- EBS (Elastic Block Store)
- EFS (Elastic File System)
- FSx (Amazon FSx)
- Glacier (Amazon S3 Glacier)

### ネットワーキング・配信
- VPC (Virtual Private Cloud)
- CloudFront (Amazon CloudFront)
- Route53 (Amazon Route 53)
- API Gateway (Amazon API Gateway)

### 開発者ツール
- CodeCommit (AWS CodeCommit)
- CodeBuild (AWS CodeBuild)
- CodeDeploy (AWS CodeDeploy)
- CodePipeline (AWS CodePipeline)

### 分析・機械学習
- Athena (Amazon Athena)
- Glue (AWS Glue)
- Kinesis (Amazon Kinesis)
- SageMaker (Amazon SageMaker)

### 管理・監視
- CloudFormation (AWS CloudFormation)
- CloudWatch (Amazon CloudWatch)
- IAM (Identity and Access Management)
- Systems Manager (AWS Systems Manager)
- Config (AWS Config)

### セキュリティ・アイデンティティ
- Cognito (Amazon Cognito)
- Directory Service (AWS Directory Service)
- WAF (AWS WAF)
- Shield (AWS Shield)
- GuardDuty (Amazon GuardDuty)
- Inspector (Amazon Inspector)
- Macie (Amazon Macie)
- Secrets Manager (AWS Secrets Manager)

### アプリケーション統合
- SNS (Simple Notification Service)
- SQS (Simple Queue Service)
- SES (Simple Email Service)
- Pinpoint (Amazon Pinpoint)

### エンドユーザーコンピューティング
- WorkSpaces (Amazon WorkSpaces)
- AppStream (Amazon AppStream 2.0)

### カスタマーエンゲージメント
- Connect (Amazon Connect)
- Chime (Amazon Chime)

### 移行・転送
- Application Discovery Service (AWS Application Discovery Service)
- Migration Hub (AWS Migration Hub)
- Database Migration Service (AWS Database Migration Service)
- Server Migration Service (AWS Server Migration Service)
- DataSync (AWS DataSync)
- Storage Gateway (AWS Storage Gateway)

### ネットワーキング・コンテンツ配信（追加）
- Direct Connect (AWS Direct Connect)
- Transit Gateway (AWS Transit Gateway)
- PrivateLink (AWS PrivateLink)
- Global Accelerator (AWS Global Accelerator)
- App Mesh (AWS App Mesh)
- Cloud Map (AWS Cloud Map)

### アプリケーション統合（追加）
- EventBridge (Amazon EventBridge)
- Step Functions (AWS Step Functions)

### コンピューティング（追加）
- Batch (AWS Batch)
- Fargate (AWS Fargate)
- Lightsail (Amazon Lightsail)

### 管理・監視（追加）
- CloudTrail (AWS CloudTrail)
- X-Ray (AWS X-Ray)
- Trusted Advisor (AWS Trusted Advisor)
- Organizations (AWS Organizations)
- Control Tower (AWS Control Tower)
- Service Catalog (AWS Service Catalog)
- Well-Architected Tool (AWS Well-Architected Tool)
- Resource Groups (AWS Resource Groups)
- Tag Editor (AWS Tag Editor)

### 請求・コスト管理
- Cost Explorer (AWS Cost Explorer)
- Budgets (AWS Budgets)
- Billing (AWS Billing)

### その他のサービス
- Marketplace (AWS Marketplace)
- License Manager (AWS License Manager)
- Personal Health Dashboard (AWS Personal Health Dashboard)
- Support (AWS Support)

### エッジ・ハイブリッド
- Outposts (AWS Outposts)
- Local Zones (AWS Local Zones)
- Wavelength (AWS Wavelength)