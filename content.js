// AWS用語辞書のメインスクリプト
class AWSTermsDictionary {
  constructor() {
    this.enabled = false;
    this.currentLanguage = 'ja';
    this.fontSize = 'medium';
    this.theme = 'auto';
    this.tooltip = null;
    this.awsTerms = {};
    this.isDataLoaded = false;
    this.boundDocumentClickHandler = null;
    this.isAWSRelatedSite = false;
    this.init();
  }

  // AWS関連サイトかどうかを判定
  checkAWSRelatedSite() {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const pageContent = document.body ? document.body.textContent.toLowerCase() : '';

    // 1. AWS公式ドメイン
    const awsOfficialDomains = [
      'aws.amazon.com',
      'docs.aws.amazon.com',
      'console.aws.amazon.com',
      'aws.amazon.co.jp',
      'awseducate.com',
      'amazonaws.com'
    ];

    // 2. AWS関連の技術サイト
    const awsTechSites = [
      'qiita.com',
      'zenn.dev',
      'dev.to',
      'medium.com',
      'stackoverflow.com',
      'github.com',
      'techblog',
      'engineering',
      'developers',
      'blog'
    ];

    // 3. AWS関連キーワード（URL）
    const awsUrlKeywords = [
      'aws',
      'amazon-web-services',
      'cloud',
      'serverless',
      'lambda',
      'ec2',
      's3'
    ];

    // 4. AWS関連キーワード（コンテンツ）
    const awsContentKeywords = [
      'aws',
      'amazon web services',
      'ec2',
      's3',
      'lambda',
      'cloudformation',
      'vpc',
      'iam',
      'rds',
      'dynamodb',
      'cloudwatch',
      'api gateway'
    ];

    // AWS公式サイトの場合
    if (awsOfficialDomains.some(domain => hostname.includes(domain))) {
      return true;
    }

    // 技術サイト + AWS関連URLの場合
    if (awsTechSites.some(site => hostname.includes(site))) {
      if (awsUrlKeywords.some(keyword => pathname.includes(keyword))) {
        return true;
      }
    }

    // ページコンテンツにAWS用語が複数含まれている場合
    const awsKeywordCount = awsContentKeywords.filter(keyword =>
      pageContent.includes(keyword)
    ).length;

    if (awsKeywordCount >= 2) {
      return true;
    }

    // タイトルにAWS関連キーワードが含まれている場合
    const title = document.title.toLowerCase();
    if (awsUrlKeywords.some(keyword => title.includes(keyword))) {
      return true;
    }

    return false;
  }

  // AWS用語データの読み込み
  async loadTermsData() {
    // まずフォールバックデータを設定（即座に利用可能にする）
    this.awsTerms = this.getFallbackTerms();
    this.isDataLoaded = true;

    try {
      // 複数の方法でデータ読み込みを試行
      const loadedData = await this.tryLoadData();

      if (loadedData) {
        this.awsTerms = loadedData;
      }
    } catch (error) {
      // エラー時はフォールバックデータを使用
    }
  }

  // シンプルなデータ読み込み（軽量化）
  async tryLoadData() {
    try {
      return await this.loadDataWithFetch();
    } catch (error) {
      return null;
    }
  }

  // 方法1: 通常のfetch
  async loadDataWithFetch() {
    const [jaResponse, enResponse] = await Promise.all([
      fetch(chrome.runtime.getURL('data/aws-terms-ja.json')),
      fetch(chrome.runtime.getURL('data/aws-terms-en.json'))
    ]);

    if (!jaResponse.ok || !enResponse.ok) {
      throw new Error(`HTTP error! ja: ${jaResponse.status}, en: ${enResponse.status}`);
    }

    const [jaData, enData] = await Promise.all([
      jaResponse.json(),
      enResponse.json()
    ]);

    return this.mergeTermsData(jaData, enData);
  }



  // データをマージする共通関数
  mergeTermsData(jaData, enData) {
    const mergedData = {};
    for (const term in jaData) {
      mergedData[term] = {
        ja: jaData[term],
        en: enData[term] || jaData[term] // 英語データがない場合は日本語をフォールバック
      };
    }
    return mergedData;
  }

  // フォールバック用の基本データ（軽量化）
  getFallbackTerms() {
    return {
      'EC2': {
        ja: {
          name: 'Elastic Compute Cloud',
          description: 'AWSのクラウド上で仮想サーバーを提供するサービス。'
        },
        en: {
          name: 'Elastic Compute Cloud',
          description: 'A web service that provides resizable compute capacity in the cloud.'
        }
      },
      'RDS': {
        ja: {
          name: 'Relational Database Service',
          description: 'AWSが提供するマネージドリレーショナルデータベースサービス。MySQL、PostgreSQL、Oracle、SQL Serverなどをサポート。',
          usability: {
            reviews: ['データベース管理の手間が大幅に削減されました', 'バックアップやパッチ適用が自動化されているのが便利'],
            pros: ['管理作業の自動化', '高可用性', 'スケーラブル'],
            cons: ['カスタマイズの制限', 'コストが高め']
          }
        },
        en: {
          name: 'Relational Database Service',
          description: 'A managed relational database service that supports MySQL, PostgreSQL, Oracle, SQL Server, and more.',
          usability: {
            reviews: ['Significantly reduced database management overhead', 'Automated backups and patching are very convenient'],
            pros: ['Automated management', 'High availability', 'Scalable'],
            cons: ['Limited customization', 'Higher cost']
          }
        }
      },
      'S3': {
        ja: {
          name: 'Simple Storage Service',
          description: 'AWSが提供するオブジェクトストレージサービス。Webアプリケーション、バックアップ、データアーカイブなどに利用。',
          usability: {
            reviews: ['シンプルで使いやすく、信頼性も高いです', 'ファイルの管理がとても楽になりました'],
            pros: ['高い耐久性', 'スケーラブル', '豊富な機能'],
            cons: ['料金体系が複雑', 'データ転送料金']
          }
        },
        en: {
          name: 'Simple Storage Service',
          description: 'Object storage service for web applications, backup, data archiving, and more.',
          usability: {
            reviews: ['Simple to use and highly reliable', 'File management has become much easier'],
            pros: ['High durability', 'Scalable', 'Rich features'],
            cons: ['Complex pricing structure', 'Data transfer costs']
          }
        }
      },
      'Lambda': {
        ja: {
          name: 'AWS Lambda',
          description: 'サーバーレスコンピューティングサービス。サーバーの管理なしでコードを実行できる。',
          usability: {
            reviews: ['サーバー管理が不要で開発に集中できます', 'イベント駆動の処理に最適です'],
            pros: ['サーバー管理不要', '自動スケーリング', '従量課金'],
            cons: ['実行時間制限', 'コールドスタート']
          }
        },
        en: {
          name: 'AWS Lambda',
          description: 'Serverless computing service that lets you run code without provisioning or managing servers.',
          usability: {
            reviews: ['No server management allows focus on development', 'Perfect for event-driven processing'],
            pros: ['No server management', 'Auto-scaling', 'Pay-per-use'],
            cons: ['Execution time limits', 'Cold start latency']
          }
        }
      },
      'VPC': {
        ja: {
          name: 'Virtual Private Cloud',
          description: 'AWS内に論理的に分離されたプライベートネットワーク環境を構築するサービス。',
          usability: {
            reviews: ['ネットワーク設計の自由度が高いです', 'セキュリティ要件に合わせて柔軟に設定できます'],
            pros: ['高いセキュリティ', '柔軟なネットワーク設計', 'オンプレミスとの接続'],
            cons: ['設定が複雑', 'ネットワーク知識が必要']
          }
        },
        en: {
          name: 'Virtual Private Cloud',
          description: 'Service to create a logically isolated private network environment within AWS.',
          usability: {
            reviews: ['High degree of freedom in network design', 'Flexible configuration for security requirements'],
            pros: ['High security', 'Flexible network design', 'On-premises connectivity'],
            cons: ['Complex configuration', 'Network knowledge required']
          }
        }
      },
      'CDK': {
        ja: {
          name: 'AWS Cloud Development Kit',
          description: 'プログラミング言語を使ってAWSリソースを定義・デプロイできるオープンソースのソフトウェア開発フレームワーク。TypeScript、Python、Java、C#などをサポート。',
          usability: {
            reviews: ['コードでインフラを管理できるので、バージョン管理やレビューがしやすいです', '慣れ親しんだプログラミング言語で書けるのが嬉しいです'],
            pros: ['プログラミング言語で記述可能', '型安全性とIDE支援', '再利用可能なコンポーネント'],
            cons: ['学習コスト', 'デプロイ時間', 'デバッグの複雑さ']
          }
        },
        en: {
          name: 'AWS Cloud Development Kit',
          description: 'An open-source software development framework for defining and deploying AWS resources using familiar programming languages like TypeScript, Python, Java, and C#.',
          usability: {
            reviews: ['Managing infrastructure as code makes version control and reviews much easier', 'Being able to write in familiar programming languages is a huge advantage'],
            pros: ['Programming language support', 'Type safety and IDE support', 'Reusable components'],
            cons: ['Learning curve', 'Deployment time', 'Debugging complexity']
          }
        }
      },
      'Aurora': {
        ja: {
          name: 'Amazon Aurora',
          description: 'AWSが開発したクラウドネイティブなリレーショナルデータベース。MySQL・PostgreSQLと互換性があり、従来のデータベースより最大5倍高速で、高可用性とスケーラビリティを提供。',
          usability: {
            reviews: ['パフォーマンスが本当に素晴らしく、レスポンスが劇的に改善されました', '自動フェイルオーバーが優秀で、ダウンタイムがほとんどありません'],
            pros: ['高いパフォーマンス', '自動スケーリング', '高可用性', 'MySQL・PostgreSQL互換'],
            cons: ['コストが高い', 'ベンダーロックイン', '地域制限']
          }
        },
        en: {
          name: 'Amazon Aurora',
          description: 'A cloud-native relational database built by AWS, compatible with MySQL and PostgreSQL, offering up to 5x better performance than traditional databases with high availability and scalability.',
          usability: {
            reviews: ['The performance is truly outstanding, response times improved dramatically', 'Automatic failover works excellently with minimal downtime'],
            pros: ['High performance', 'Auto-scaling', 'High availability', 'MySQL/PostgreSQL compatibility'],
            cons: ['Higher cost', 'Vendor lock-in', 'Regional limitations']
          }
        }
      },
      'Savings Plans': {
        ja: {
          name: 'AWS Savings Plans',
          description: '1年または3年の期間でAWSの使用量をコミットすることで、オンデマンド料金と比較して最大72%の割引を受けられる柔軟な料金モデル。',
          usability: {
            reviews: ['長期利用が決まっているなら、コスト削減効果が本当に大きいです', 'リザーブドインスタンスより柔軟で、インスタンスタイプを変更しても割引が適用されます'],
            pros: ['大幅なコスト削減', '柔軟性', '複数サービスに適用', '自動適用'],
            cons: ['長期コミット必要', '計算が複雑', '途中解約不可']
          }
        },
        en: {
          name: 'AWS Savings Plans',
          description: 'A flexible pricing model that offers significant savings on AWS usage by committing to a consistent amount of usage for 1 or 3 years, providing up to 72% savings compared to On-Demand pricing.',
          usability: {
            reviews: ['If you have long-term usage planned, the cost savings are truly substantial', 'More flexible than Reserved Instances - discounts apply even when changing instance types'],
            pros: ['Significant cost savings', 'Flexibility', 'Applies to multiple services', 'Automatic application'],
            cons: ['Long-term commitment required', 'Complex calculations', 'No early termination']
          }
        }
      },
      'Spot Instances': {
        ja: {
          name: 'Amazon EC2 Spot Instances',
          description: 'AWSの余剰キャパシティを利用することで、オンデマンド価格の最大90%割引で利用できるEC2インスタンス。需要と供給に基づいて価格が変動。',
          usability: {
            reviews: ['バッチ処理やテスト環境で使うと、コストが劇的に下がります', '中断される可能性があるので、ステートレスなワークロードに最適です'],
            pros: ['大幅なコスト削減（最大90%OFF）', '大規模な並列処理に最適', '柔軟な価格設定'],
            cons: ['インスタンス中断のリスク', '価格変動', 'ステートフルアプリには不向き']
          }
        },
        en: {
          name: 'Amazon EC2 Spot Instances',
          description: 'EC2 instances that use spare AWS capacity at up to 90% discount compared to On-Demand prices. Pricing fluctuates based on supply and demand.',
          usability: {
            reviews: ['Perfect for batch processing and test environments - costs drop dramatically', 'Great for stateless workloads since interruption is possible'],
            pros: ['Massive cost savings (up to 90% off)', 'Perfect for large-scale parallel processing', 'Flexible pricing'],
            cons: ['Instance interruption risk', 'Price volatility', 'Not suitable for stateful applications']
          }
        }
      },
      'Reserved Instances': {
        ja: {
          name: 'Amazon EC2 Reserved Instances',
          description: '1年または3年の期間でEC2インスタンスの使用をコミットすることで、オンデマンド料金と比較して最大75%の割引を受けられる料金オプション。',
          usability: {
            reviews: ['長期間同じインスタンスタイプを使う予定なら、コスト削減効果が絶大です', '予約したインスタンスタイプを変更できないので、事前の計画が重要です'],
            pros: ['大幅なコスト削減（最大75%OFF）', '予測可能な料金', 'キャパシティ予約', 'マーケットプレイスでの売買可能'],
            cons: ['長期コミット必要', '柔軟性の制限', '途中解約不可', 'インスタンスタイプ変更制限']
          }
        },
        en: {
          name: 'Amazon EC2 Reserved Instances',
          description: 'A pricing option that provides up to 75% discount compared to On-Demand pricing by committing to use EC2 instances for 1 or 3 years.',
          usability: {
            reviews: ['If you plan to use the same instance type long-term, the cost savings are tremendous', 'Can\'t change the reserved instance type, so upfront planning is crucial'],
            pros: ['Significant cost savings (up to 75% off)', 'Predictable pricing', 'Capacity reservation', 'Marketplace trading available'],
            cons: ['Long-term commitment required', 'Limited flexibility', 'No early termination', 'Instance type change restrictions']
          }
        }
      },
      'Security Groups': {
        ja: {
          name: 'Amazon EC2 Security Groups',
          description: 'EC2インスタンスレベルで動作する仮想ファイアウォール。インバウンドとアウトバウンドのトラフィックを制御し、ステートフルな接続追跡を行う。',
          usability: {
            reviews: ['設定が直感的で、ネットワークセキュリティの基本として使いやすいです', 'ステートフルなので、戻りトラフィックを自動で許可してくれるのが便利です'],
            pros: ['ステートフルな接続追跡', 'インスタンスレベルの制御', 'リアルタイム適用', 'デフォルトで安全な設定'],
            cons: ['拒否ルールが設定できない', 'ログ機能がない', 'ルール数の制限']
          }
        },
        en: {
          name: 'Amazon EC2 Security Groups',
          description: 'Virtual firewalls that operate at the EC2 instance level, controlling inbound and outbound traffic with stateful connection tracking.',
          usability: {
            reviews: ['Intuitive configuration makes it great as a network security foundation', 'Stateful nature automatically allows return traffic, which is very convenient'],
            pros: ['Stateful connection tracking', 'Instance-level control', 'Real-time application', 'Secure default settings'],
            cons: ['Cannot set deny rules', 'No logging capability', 'Rule number limitations']
          }
        }
      },
      'セキュリティグループ': {
        ja: {
          name: 'Security Groups',
          description: 'EC2インスタンスレベルで動作する仮想ファイアウォール。インバウンドとアウトバウンドのトラフィックを制御し、ステートフルな接続追跡を行う。',
          usability: {
            reviews: ['設定が直感的で、ネットワークセキュリティの基本として使いやすいです', 'ステートフルなので、戻りトラフィックを自動で許可してくれるのが便利です'],
            pros: ['ステートフルな接続追跡', 'インスタンスレベルの制御', 'リアルタイム適用', 'デフォルトで安全な設定'],
            cons: ['拒否ルールが設定できない', 'ログ機能がない', 'ルール数の制限']
          }
        },
        en: {
          name: 'Security Groups',
          description: 'Virtual firewalls that operate at the EC2 instance level, controlling inbound and outbound traffic with stateful connection tracking.',
          usability: {
            reviews: ['Intuitive configuration makes it great as a network security foundation', 'Stateful nature automatically allows return traffic, which is very convenient'],
            pros: ['Stateful connection tracking', 'Instance-level control', 'Real-time application', 'Secure default settings'],
            cons: ['Cannot set deny rules', 'No logging capability', 'Rule number limitations']
          }
        }
      },
      'CloudWatch Logs': {
        ja: {
          name: 'Amazon CloudWatch Logs',
          description: 'AWSのログ管理サービス。アプリケーションやシステムのログを収集、監視、保存し、リアルタイムでの分析やアラート設定が可能。',
          usability: {
            reviews: ['ログの検索機能が強力で、問題の原因を素早く特定できます', 'リアルタイムでログを確認できるので、デバッグが効率的になりました'],
            pros: ['リアルタイムログ監視', '強力な検索・フィルタ機能', '他のAWSサービスとの連携'],
            cons: ['ログ保存コスト', '大量ログでの検索速度', '保存期間の制限']
          }
        },
        en: {
          name: 'Amazon CloudWatch Logs',
          description: 'Log management service for AWS. Collects, monitors, and stores application and system logs with real-time analysis and alerting capabilities.',
          usability: {
            reviews: ['The search functionality is powerful and helps identify issues quickly', 'Real-time log viewing makes debugging much more efficient'],
            pros: ['Real-time log monitoring', 'Powerful search and filtering', 'AWS service integration'],
            cons: ['Log storage costs', 'Search speed with large volumes', 'Retention period limitations']
          }
        }
      },
      'API Gateway': {
        ja: {
          name: 'Amazon API Gateway',
          description: 'RESTful APIやWebSocket APIを作成、公開、維持、監視、保護するためのフルマネージドサービス。API開発を簡素化。',
          usability: {
            reviews: ['API作成が簡単で、認証機能も充実しています', 'Lambdaとの連携がスムーズで開発効率が上がりました'],
            pros: ['簡単なAPI作成', 'Lambda連携', '認証・認可機能'],
            cons: ['レスポンス時間制限', 'コールドスタート', '複雑な設定']
          }
        },
        en: {
          name: 'Amazon API Gateway',
          description: 'Fully managed service for creating, publishing, maintaining, monitoring, and securing RESTful APIs and WebSocket APIs.',
          usability: {
            reviews: ['Easy API creation with comprehensive authentication features', 'Smooth Lambda integration improves development efficiency'],
            pros: ['Easy API creation', 'Lambda integration', 'Authentication features'],
            cons: ['Response time limits', 'Cold start latency', 'Complex configuration']
          }
        }
      },
      'Route 53': {
        ja: {
          name: 'Amazon Route 53',
          description: '高可用性でスケーラブルなDNSウェブサービス。ドメイン登録、DNS管理、ヘルスチェック、トラフィックルーティングを提供。',
          usability: {
            reviews: ['DNS設定のUIが分かりやすく、初心者でも扱いやすいです', 'ヘルスチェック機能で自動フェイルオーバーができて安心です'],
            pros: ['高可用性', '豊富なルーティング機能', 'ヘルスチェック'],
            cons: ['料金体系の複雑さ', '学習コスト', 'ドメイン移管の手間']
          }
        },
        en: {
          name: 'Amazon Route 53',
          description: 'Highly available and scalable DNS web service providing domain registration, DNS management, health checks, and traffic routing.',
          usability: {
            reviews: ['DNS configuration UI is intuitive and beginner-friendly', 'Health check features provide automatic failover capabilities'],
            pros: ['High availability', 'Rich routing features', 'Health checks'],
            cons: ['Complex pricing structure', 'Learning curve', 'Domain transfer complexity']
          }
        }
      },
      'VPC ピアリング': {
        ja: {
          name: 'VPC Peering',
          description: '異なるVPC間をプライベートネットワークで接続するサービス。同一リージョンまたは異なるリージョン、異なるアカウント間でも接続可能。',
          usability: {
            reviews: ['複数のVPC間でプライベート通信ができて、セキュリティが向上しました', 'クロスアカウント接続も簡単に設定できます'],
            pros: ['プライベート接続', 'クロスアカウント対応', 'クロスリージョン対応'],
            cons: ['複雑なルーティング', '接続制限', '推移的ルーティング不可']
          }
        },
        en: {
          name: 'VPC Peering',
          description: 'Service to connect different VPCs through private network. Can connect across regions and accounts.',
          usability: {
            reviews: ['Private communication between VPCs improved security', 'Cross-account connections are easy to set up'],
            pros: ['Private connection', 'Cross-account support', 'Cross-region support'],
            cons: ['Complex routing', 'Connection limits', 'No transitive routing']
          }
        }
      },
      'VPCピアリング': {
        ja: {
          name: 'VPC Peering',
          description: '異なるVPC間をプライベートネットワークで接続するサービス。同一リージョンまたは異なるリージョン、異なるアカウント間でも接続可能。',
          usability: {
            reviews: ['複数のVPC間でプライベート通信ができて、セキュリティが向上しました', 'クロスアカウント接続も簡単に設定できます'],
            pros: ['プライベート接続', 'クロスアカウント対応', 'クロスリージョン対応'],
            cons: ['複雑なルーティング', '接続制限', '推移的ルーティング不可']
          }
        },
        en: {
          name: 'VPC Peering',
          description: 'Service to connect different VPCs through private network. Can connect across regions and accounts.',
          usability: {
            reviews: ['Private communication between VPCs improved security', 'Cross-account connections are easy to set up'],
            pros: ['Private connection', 'Cross-account support', 'Cross-region support'],
            cons: ['Complex routing', 'Connection limits', 'No transitive routing']
          }
        }
      },
      'Network ACL': {
        ja: {
          name: 'Network Access Control List',
          description: 'サブネットレベルで動作するステートレスなファイアウォール。番号付きルールに基づいてトラフィックを評価し、許可・拒否の両方のルールを設定可能。',
          usability: {
            reviews: ['サブネット全体を保護できるので、多層防御の一部として重要です', 'ステートレスなので、インバウンドとアウトバウンドの両方を明示的に設定する必要があります'],
            pros: ['サブネットレベルの制御', '拒否ルールの設定可能', '番号付きルールによる優先順位', '追加のセキュリティ層'],
            cons: ['設定が複雑', 'ステートレスのため設定漏れリスク', 'デバッグが困難']
          }
        },
        en: {
          name: 'Network Access Control List',
          description: 'Stateless firewall operating at the subnet level, evaluating traffic based on numbered rules with both allow and deny rules possible.',
          usability: {
            reviews: ['Can protect entire subnets, making it important for defense in depth', 'Being stateless requires explicit configuration of both inbound and outbound rules'],
            pros: ['Subnet-level control', 'Deny rules configurable', 'Numbered rule priorities', 'Additional security layer'],
            cons: ['Complex configuration', 'Risk of configuration gaps due to stateless nature', 'Difficult debugging']
          }
        }
      },
      'CloudWatch Logs': {
        ja: {
          name: 'Amazon CloudWatch Logs',
          description: 'AWSのログ管理サービス。アプリケーションやシステムのログを収集、監視、保存し、リアルタイムでの分析やアラート設定が可能。',
          usability: {
            reviews: ['ログの検索機能が強力で、問題の原因を素早く特定できます', 'リアルタイムでログを確認できるので、デバッグが効率的になりました'],
            pros: ['リアルタイムログ監視', '強力な検索・フィルタ機能', '他のAWSサービスとの連携'],
            cons: ['ログ保存コスト', '大量ログでの検索速度', '保存期間の制限']
          }
        },
        en: {
          name: 'Amazon CloudWatch Logs',
          description: 'Log management service for AWS. Collects, monitors, and stores application and system logs with real-time analysis and alerting capabilities.',
          usability: {
            reviews: ['The search functionality is powerful and helps identify issues quickly', 'Real-time log viewing makes debugging much more efficient'],
            pros: ['Real-time log monitoring', 'Powerful search and filtering', 'AWS service integration'],
            cons: ['Log storage costs', 'Search speed with large volumes', 'Retention period limitations']
          }
        }
      },
      'ALB': {
        ja: {
          name: 'Application Load Balancer',
          description: 'レイヤー7（アプリケーション層）で動作するロードバランサー。HTTP/HTTPSトラフィックを複数のターゲットに分散し、パスベースやホストベースのルーティングが可能。',
          usability: {
            reviews: ['パスベースルーティングが便利で、マイクロサービス構成に最適です', 'WebSocketやHTTP/2にも対応していて、モダンなアプリケーションに使いやすいです'],
            pros: ['高度なルーティング機能', 'WebSocket・HTTP/2対応', 'SSL終端処理'],
            cons: ['NLBより高コスト', 'レイヤー4より処理負荷大', '設定の複雑さ']
          }
        },
        en: {
          name: 'Application Load Balancer',
          description: 'Layer 7 (application layer) load balancer that distributes HTTP/HTTPS traffic across multiple targets with path-based and host-based routing capabilities.',
          usability: {
            reviews: ['Path-based routing is very convenient and perfect for microservices architecture', 'WebSocket and HTTP/2 support makes it great for modern applications'],
            pros: ['Advanced routing features', 'WebSocket & HTTP/2 support', 'SSL termination'],
            cons: ['Higher cost than NLB', 'More processing overhead than Layer 4', 'Configuration complexity']
          }
        }
      },
      'Route 53': {
        ja: {
          name: 'Amazon Route 53',
          description: '高可用性でスケーラブルなDNSウェブサービス。ドメイン登録、DNS管理、ヘルスチェック、トラフィックルーティングを提供。',
          usability: {
            reviews: ['DNS設定のUIが分かりやすく、初心者でも扱いやすいです', 'ヘルスチェック機能で自動フェイルオーバーができて安心です'],
            pros: ['高可用性', '豊富なルーティング機能', 'ヘルスチェック'],
            cons: ['料金体系の複雑さ', '学習コスト', 'ドメイン移管の手間']
          }
        },
        en: {
          name: 'Amazon Route 53',
          description: 'Highly available and scalable DNS web service providing domain registration, DNS management, health checks, and traffic routing.',
          usability: {
            reviews: ['DNS configuration UI is intuitive and beginner-friendly', 'Health check features provide automatic failover capabilities'],
            pros: ['High availability', 'Rich routing features', 'Health checks'],
            cons: ['Complex pricing structure', 'Learning curve', 'Domain transfer complexity']
          }
        }
      },
      'ECR': {
        ja: {
          name: 'Amazon Elastic Container Registry',
          description: 'Dockerコンテナイメージを保存・管理するフルマネージドなコンテナレジストリサービス。ECSやEKSと連携してコンテナデプロイメントを支援。',
          usability: {
            reviews: ['Dockerイメージの管理が一元化できて、デプロイが楽になりました', 'ECSとの連携がスムーズで、コンテナ運用が効率的です'],
            pros: ['フルマネージド', 'ECS/EKS連携', 'プライベートレジストリ'],
            cons: ['ストレージコスト', '転送料金', '地域制限']
          }
        },
        en: {
          name: 'Amazon Elastic Container Registry',
          description: 'Fully managed Docker container registry service for storing and managing container images. Integrates with ECS and EKS for container deployment.',
          usability: {
            reviews: ['Centralized Docker image management makes deployment much easier', 'Smooth integration with ECS makes container operations efficient'],
            pros: ['Fully managed', 'ECS/EKS integration', 'Private registry'],
            cons: ['Storage costs', 'Transfer charges', 'Regional limitations']
          }
        }
      },
      'KMS': {
        ja: {
          name: 'AWS Key Management Service',
          description: '暗号化キーの作成・管理を行うマネージドサービス。AWSサービスとの統合により、データの暗号化・復号化を簡単に実装可能。',
          usability: {
            reviews: ['暗号化キーの管理が一元化できて、セキュリティが向上しました', '他のAWSサービスとの連携が簡単で、実装が楽です'],
            pros: ['マネージドサービス', 'AWSサービス統合', '監査ログ'],
            cons: ['API呼び出し料金', 'キー管理の複雑さ', '地域制限']
          }
        },
        en: {
          name: 'AWS Key Management Service',
          description: 'Managed service for creating and managing encryption keys. Integrates with AWS services to easily implement data encryption and decryption.',
          usability: {
            reviews: ['Centralized encryption key management improved security', 'Integration with other AWS services is simple and easy to implement'],
            pros: ['Managed service', 'AWS service integration', 'Audit logging'],
            cons: ['API call charges', 'Key management complexity', 'Regional limitations']
          }
        }
      },
      'EMR': {
        ja: {
          name: 'Amazon EMR',
          description: 'Apache Spark、Hadoop、HBaseなどのビッグデータフレームワークを実行するマネージドクラスターサービス。大規模データ処理と分析を効率化。',
          usability: {
            reviews: ['大規模データ処理が簡単にできるようになりました', 'Sparkクラスターの管理が自動化されて、運用が楽です'],
            pros: ['マネージドクラスター', '複数フレームワーク対応', '自動スケーリング'],
            cons: ['学習コスト', '設定の複雑さ', '起動時間']
          }
        },
        en: {
          name: 'Amazon EMR',
          description: 'Managed cluster service for running big data frameworks like Apache Spark, Hadoop, and HBase. Streamlines large-scale data processing and analysis.',
          usability: {
            reviews: ['Large-scale data processing became simple', 'Automated Spark cluster management makes operations easier'],
            pros: ['Managed clusters', 'Multiple framework support', 'Auto scaling'],
            cons: ['Learning curve', 'Configuration complexity', 'Startup time']
          }
        }
      },
      'ロードバランサー': {
        ja: {
          name: 'Load Balancer',
          description: '複数のサーバーやインスタンスにトラフィックを分散するサービス。ALB（Application Load Balancer）、NLB（Network Load Balancer）、CLB（Classic Load Balancer）などがある。',
          usability: {
            reviews: ['高可用性を簡単に実現できて、運用が楽になりました', '自動的にヘルスチェックをしてくれるので安心です'],
            pros: ['高可用性', '自動ヘルスチェック', 'SSL終端処理', '複数のロードバランサータイプ'],
            cons: ['設定の複雑さ', 'コスト', 'レイテンシの増加']
          }
        },
        en: {
          name: 'Load Balancer',
          description: 'Service that distributes traffic across multiple servers or instances. Includes ALB (Application Load Balancer), NLB (Network Load Balancer), and CLB (Classic Load Balancer).',
          usability: {
            reviews: ['Easy to achieve high availability and simplified operations', 'Automatic health checks provide peace of mind'],
            pros: ['High availability', 'Automatic health checks', 'SSL termination', 'Multiple load balancer types'],
            cons: ['Configuration complexity', 'Cost', 'Increased latency']
          }
        }
      },
      'オートスケーリンググループ': {
        ja: {
          name: 'Auto Scaling Group',
          description: 'EC2インスタンスの数を需要に応じて自動的に調整するサービス。トラフィックの増減に合わせてインスタンスを起動・終了し、コスト最適化と可用性を両立。',
          usability: {
            reviews: ['トラフィック変動に自動で対応してくれるので、運用負荷が大幅に軽減されました', 'コスト削減効果が目に見えて分かります'],
            pros: ['自動スケーリング', 'コスト最適化', '高可用性', 'ヘルスチェック機能'],
            cons: ['設定の複雑さ', 'スケーリング遅延', '予期しないスケーリング']
          }
        },
        en: {
          name: 'Auto Scaling Group',
          description: 'Service that automatically adjusts the number of EC2 instances based on demand. Launches and terminates instances according to traffic fluctuations, balancing cost optimization and availability.',
          usability: {
            reviews: ['Automatically handles traffic fluctuations, significantly reducing operational overhead', 'Cost reduction benefits are clearly visible'],
            pros: ['Automatic scaling', 'Cost optimization', 'High availability', 'Health check functionality'],
            cons: ['Configuration complexity', 'Scaling delays', 'Unexpected scaling events']
          }
        }
      },
      'AWS Well-Architected Framework': {
        ja: {
          name: 'AWS Well-Architected Framework',
          description: 'AWSでシステムを構築する際のベストプラクティスを体系化したフレームワーク。運用上の優秀性、セキュリティ、信頼性、パフォーマンス効率、コスト最適化の5つの柱で構成。',
          usability: {
            reviews: ['システム設計の指針として非常に有用で、品質向上に役立ちます', '5つの柱に沿って設計することで、バランスの取れたシステムが構築できます'],
            pros: ['体系的な設計指針', 'ベストプラクティス集約', '継続的改善', '品質向上'],
            cons: ['学習コスト', '実装の複雑さ', '完璧な適用の困難さ']
          }
        },
        en: {
          name: 'AWS Well-Architected Framework',
          description: 'A systematic framework of best practices for building systems on AWS, consisting of five pillars: Operational Excellence, Security, Reliability, Performance Efficiency, and Cost Optimization.',
          usability: {
            reviews: ['Extremely valuable as a system design guideline, helping improve quality', 'Designing along the five pillars enables building well-balanced systems'],
            pros: ['Systematic design guidelines', 'Best practices consolidation', 'Continuous improvement', 'Quality enhancement'],
            cons: ['Learning curve', 'Implementation complexity', 'Difficulty achieving perfect compliance']
          }
        }
      },
      'インターネットゲートウェイ': {
        ja: {
          name: 'Internet Gateway',
          description: 'VPCとインターネット間の通信を可能にするゲートウェイ。パブリックサブネット内のリソースがインターネットにアクセスするために必要。',
          usability: {
            reviews: ['VPCからインターネットへの接続が簡単に設定できます', '高可用性が保証されているので、安心して使えます'],
            pros: ['高可用性', 'スケーラブル', '追加料金なし', '簡単設定'],
            cons: ['セキュリティリスク', 'パブリックIP必要', '設定の複雑さ']
          }
        },
        en: {
          name: 'Internet Gateway',
          description: 'Gateway that enables communication between VPC and the internet. Required for resources in public subnets to access the internet.',
          usability: {
            reviews: ['Easy to set up internet connectivity from VPC', 'High availability is guaranteed, providing peace of mind'],
            pros: ['High availability', 'Scalable', 'No additional charges', 'Easy setup'],
            cons: ['Security risks', 'Public IP required', 'Configuration complexity']
          }
        }
      },
      'Boto3': {
        ja: {
          name: 'AWS SDK for Python (Boto3)',
          description: 'PythonでAWSサービスを操作するための公式SDK。EC2、S3、DynamoDBなど、ほぼすべてのAWSサービスをプログラムから制御可能。',
          usability: {
            reviews: ['Pythonでクラウドリソースを管理できて、自動化が簡単になりました', 'ドキュメントが充実していて、サンプルコードも豊富で学習しやすいです'],
            pros: ['豊富なAWSサービス対応', '充実したドキュメント', '自動化・スクリプト化が容易'],
            cons: ['Python知識が必要', 'APIの変更に追従が必要', '認証情報の管理']
          }
        },
        en: {
          name: 'AWS SDK for Python (Boto3)',
          description: 'Official SDK for controlling AWS services from Python. Enables programmatic control of nearly all AWS services including EC2, S3, DynamoDB, and more.',
          usability: {
            reviews: ['Managing cloud resources with Python has made automation much simpler', 'Excellent documentation with abundant sample code makes learning easy'],
            pros: ['Extensive AWS service coverage', 'Comprehensive documentation', 'Easy automation and scripting'],
            cons: ['Python knowledge required', 'Need to track API changes', 'Credential management complexity']
          }
        }
      },
      'Parameter Store': {
        ja: {
          name: 'AWS Systems Manager Parameter Store',
          description: '設定データや機密情報を安全に保存・管理するサービス。アプリケーションの設定値、データベース接続文字列、APIキーなどを階層的に管理。',
          usability: {
            reviews: ['設定値の管理が一元化できて、環境ごとの設定変更が楽になりました', '暗号化機能があるので、機密情報も安心して保存できます'],
            pros: ['階層的な設定管理', '暗号化対応', 'バージョン管理', 'IAM統合'],
            cons: ['パラメータサイズ制限', 'スループット制限', 'リージョン依存']
          }
        },
        en: {
          name: 'AWS Systems Manager Parameter Store',
          description: 'Service for securely storing and managing configuration data and secrets. Manages application settings, database connection strings, API keys, etc. in a hierarchical structure.',
          usability: {
            reviews: ['Centralized configuration management has made environment-specific changes much easier', 'Encryption features provide confidence when storing sensitive information'],
            pros: ['Hierarchical configuration management', 'Encryption support', 'Version control', 'IAM integration'],
            cons: ['Parameter size limitations', 'Throughput limitations', 'Regional dependency']
          }
        }
      },
      'CloudWatch Metrics': {
        ja: {
          name: 'Amazon CloudWatch Metrics',
          description: 'AWSリソースとアプリケーションのパフォーマンスメトリクスを収集・監視するサービス。CPU使用率、メモリ使用量、ネットワークトラフィックなどを可視化。',
          usability: {
            reviews: ['システムの状態が一目で分かるダッシュボードが作れて便利です', 'カスタムメトリクスも送信できるので、アプリケーション固有の監視も可能です'],
            pros: ['豊富な標準メトリクス', 'カスタムメトリクス対応', 'リアルタイム監視'],
            cons: ['カスタムメトリクスのコスト', 'データ保持期間制限', '複雑な料金体系']
          }
        },
        en: {
          name: 'Amazon CloudWatch Metrics',
          description: 'Service for collecting and monitoring performance metrics of AWS resources and applications. Visualizes CPU usage, memory consumption, network traffic, and more.',
          usability: {
            reviews: ['Creating dashboards that show system status at a glance is very convenient', 'Custom metrics can also be sent, enabling application-specific monitoring'],
            pros: ['Rich standard metrics', 'Custom metrics support', 'Real-time monitoring'],
            cons: ['Custom metrics costs', 'Data retention limits', 'Complex pricing structure']
          }
        }
      },
      'CloudWatch Alarms': {
        ja: {
          name: 'Amazon CloudWatch Alarms',
          description: 'CloudWatchメトリクスに基づいてアラートを設定し、しきい値を超えた場合に自動的にアクションを実行するサービス。SNS通知やAuto Scalingトリガーなどが可能。',
          usability: {
            reviews: ['システム異常を早期に検知できて、障害対応が迅速になりました', 'Auto Scalingと連携して、負荷に応じた自動スケーリングが実現できます'],
            pros: ['自動アクション実行', '複数通知チャネル', 'Auto Scaling連携'],
            cons: ['アラーム疲れのリスク', '複雑な条件設定', '誤検知の可能性']
          }
        },
        en: {
          name: 'Amazon CloudWatch Alarms',
          description: 'Service for setting alerts based on CloudWatch metrics and automatically executing actions when thresholds are exceeded. Supports SNS notifications, Auto Scaling triggers, and more.',
          usability: {
            reviews: ['Early detection of system anomalies has made incident response much faster', 'Integration with Auto Scaling enables automatic scaling based on load'],
            pros: ['Automatic action execution', 'Multiple notification channels', 'Auto Scaling integration'],
            cons: ['Alert fatigue risk', 'Complex condition setup', 'False positive potential']
          }
        }
      }
    };
  }

  // 初期化処理
  async init() {
    // AWS関連サイトかどうかをチェック
    this.isAWSRelatedSite = this.checkAWSRelatedSite();

    // AWS関連サイトでない場合は処理を停止
    if (!this.isAWSRelatedSite) {
      return;
    }

    // AWS用語データを読み込み
    await this.loadTermsData();

    // 保存された設定を読み込み
    const result = await this.getStorageData(['enabled', 'language', 'fontSize', 'theme']);
    this.enabled = result.enabled || false;
    this.currentLanguage = result.language || 'ja';
    this.fontSize = result.fontSize || 'medium';
    this.theme = result.theme || 'auto';

    // テーマを適用
    this.applyTheme();

    if (this.enabled) {
      this.attachEventListeners();
    }

    // メッセージリスナーの設定
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const response = this.handleMessage(message);
      if (response) {
        sendResponse(response);
      }
      return true; // 非同期レスポンスを有効化
    });


  }



  // Chrome storage APIのPromise化
  getStorageData(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  // メッセージハンドラー
  handleMessage(message) {
    if (!message || !message.action) {
      return { success: false, error: 'Invalid message format' };
    }

    // AWS関連サイトでない場合は機能を制限
    if (!this.isAWSRelatedSite) {
      return {
        success: false,
        error: 'AWS関連サイトではありません',
        isAWSRelatedSite: false
      };
    }

    const termsCount = Object.keys(this.awsTerms).length;

    switch (message.action) {
      case 'ping':
        // Content scriptの準備状態を確認するためのpingアクション
        return {
          success: true,
          ready: true,
          dataLoaded: this.isDataLoaded,
          termsCount: termsCount
        };

      case 'toggle':
        try {
          this.enabled = message.enabled;
          if (this.enabled) {
            this.attachEventListeners();
          } else {
            this.removeEventListeners();
            this.hideTooltip();
          }
          return {
            success: true,
            enabled: this.enabled,
            termsCount: termsCount
          };
        } catch (error) {
          return { success: false, error: error.message };
        }

      case 'changeLanguage':
        try {
          this.currentLanguage = message.language;
          this.hideTooltip(); // 言語変更時は既存のツールチップを非表示
          // ハイライトを再適用
          if (this.enabled) {
            this.highlightAWSTerms();
          }
          return {
            success: true,
            language: this.currentLanguage,
            termsCount: termsCount
          };
        } catch (error) {
          return { success: false, error: error.message };
        }

      case 'changeFontSize':
        try {
          this.fontSize = message.fontSize;
          // 既存のツールチップがある場合は文字サイズクラスを更新
          if (this.tooltip) {
            this.tooltip.className = `aws-tooltip font-${this.fontSize}`;
          }
          return {
            success: true,
            fontSize: this.fontSize
          };
        } catch (error) {
          return { success: false, error: error.message };
        }

      case 'changeTheme':
        try {
          this.theme = message.theme;
          this.applyTheme();
          return {
            success: true,
            theme: this.theme
          };
        } catch (error) {
          return { success: false, error: error.message };
        }

      case 'getTermsCount':
        return {
          success: true,
          termsCount: termsCount,
          enabled: this.enabled,
          language: this.currentLanguage,
          dataLoaded: this.isDataLoaded
        };

      default:
        return {
          success: false,
          error: `Unknown action: ${message.action}`
        };
    }
  }

  // イベントリスナーの追加（軽量化）
  attachEventListeners() {
    this.highlightAWSTerms();
    // バインドしたハンドラーを保存してメモリリークを防ぐ
    this.boundHandlers = {
      click: this.handleClick.bind(this),
      mouseover: this.handleMouseOver.bind(this),
      mouseout: this.handleMouseOut.bind(this)
    };
    document.addEventListener('click', this.boundHandlers.click);
    document.addEventListener('mouseover', this.boundHandlers.mouseover);
    document.addEventListener('mouseout', this.boundHandlers.mouseout);
  }

  // イベントリスナーの削除（軽量化）
  removeEventListeners() {
    this.removeHighlights();
    if (this.boundHandlers) {
      document.removeEventListener('click', this.boundHandlers.click);
      document.removeEventListener('mouseover', this.boundHandlers.mouseover);
      document.removeEventListener('mouseout', this.boundHandlers.mouseout);
      this.boundHandlers = null;
    }
  }

  // AWS用語をハイライト表示（軽量化）
  highlightAWSTerms() {
    if (!this.enabled || !this.isDataLoaded) return;

    // 既存のハイライトを削除
    this.removeHighlights();

    // パフォーマンス向上のため、requestAnimationFrameで非同期処理
    requestAnimationFrame(() => {
      this.walkTextNodes(document.body, (textNode) => {
        this.highlightTermsInTextNode(textNode);
      });
    });
  }

  // テキストノードを再帰的に検索
  walkTextNodes(node, callback) {
    // ノードが存在しない場合は処理をスキップ
    if (!node) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      callback(node);
    } else {
      // スクリプトタグやスタイルタグは除外
      if (node.tagName && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) {
        return;
      }
      // 既にハイライト済みの要素は除外
      if (node.classList && node.classList.contains('aws-term-highlight')) {
        return;
      }

      // childNodesが存在することを確認してから処理
      if (node.childNodes && node.childNodes.length > 0) {
        // childNodesを配列に変換して、DOM変更による影響を避ける
        const children = Array.from(node.childNodes);
        for (let child of children) {
          this.walkTextNodes(child, callback);
        }
      }
    }
  }

  // テキストノード内のAWS用語をハイライト
  highlightTermsInTextNode(textNode) {
    const text = textNode.textContent;
    if (!text || text.trim().length === 0) {
      return 0;
    }

    // AWS用語を複数単語優先、次に長さ順にソート（日本語対応）
    const sortedTerms = Object.keys(this.awsTerms).sort((a, b) => {
      // 日本語と英語の両方に対応した単語数計算
      const getWordCount = (term) => {
        const trimmed = term.trim();
        // 英語の場合：スペースで区切られた単語数
        const englishWordCount = trimmed.split(/\s+/).length;
        // 日本語の場合：カタカナ・ひらがな・漢字の塊の数を概算
        const japaneseSegments = trimmed.match(/[\u3040-\u309F]+|[\u30A0-\u30FF]+|[\u4E00-\u9FAF]+|[A-Za-z0-9]+/g) || [];

        // より多い方を採用（複合語を適切に評価）
        return Math.max(englishWordCount, japaneseSegments.length);
      };

      const aWordCount = getWordCount(a);
      const bWordCount = getWordCount(b);

      // まず単語数で比較（多い方を優先）
      if (aWordCount !== bWordCount) {
        return bWordCount - aWordCount;
      }

      // 単語数が同じ場合は長さで比較（長い方を優先）
      return b.length - a.length;
    });

    // デバッグログを最小限に抑制（パフォーマンス改善）
    // 重いデバッグ処理をコメントアウト

    // マッチした用語の位置を記録（重複を避けるため）
    const matchedRanges = [];
    const matches = [];

    // 各AWS用語をチェック（長い用語から順番に）
    for (const term of sortedTerms) {
      // 日本語と英語の両方に対応した境界マッチング
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 英語の場合は単語境界、日本語の場合は文字境界を使用
      const hasEnglish = /[A-Za-z]/.test(term);
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term);

      let regex;

      // 複数単語用語の特別処理
      const multiWordTerms = [
        'Security Groups', 'CloudWatch Logs', 'API Gateway', 'S3 Glacier',
        'S3 Standard', 'S3 Standard-IA', 'Route 53', 'Elastic Beanstalk',
        'Directory Service', 'Secrets Manager', 'Systems Manager',
        'Trusted Advisor', 'Database Migration Service', 'Server Migration Service',
        'Application Discovery Service', 'Cost Explorer', 'License Manager',
        'Personal Health Dashboard', 'Resource Groups', 'Tag Editor',
        'Migration Hub', 'Control Tower', 'Service Catalog', 'Well-Architected Tool'
      ];

      // カタカナ混在用語の特別処理
      const katakanaMixedTerms = [
        'セキュリティグループ', 'VPC ピアリング', 'VPCピアリング',
        'NATゲートウェイ', 'VPCエンドポイント', 'ロードバランサー',
        'オートスケーリンググループ'
      ];

      if (multiWordTerms.includes(term) || katakanaMixedTerms.includes(term)) {
        if (katakanaMixedTerms.includes(term)) {
          // カタカナ混在用語：シンプルな正規表現を使用
          regex = new RegExp(`(${escapedTerm})`, 'gi');
        } else {
          // 英語版複数単語：スペースを含む単語境界を使用
          const escapedMultiTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          regex = new RegExp(`\\b(${escapedMultiTerm})\\b`, 'gi');
        }
      } else if (hasEnglish && !hasJapanese) {
        // 英語のみの場合は単語境界を使用
        regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      } else if (hasJapanese && hasEnglish) {
        // 英語＋日本語の混在の場合（例：VPC ピアリング、VPCピアリング）
        // スペースありなしの両方に対応
        const flexibleTerm = escapedTerm.replace(/\\s+/g, '\\\\s*'); // スペースを任意のスペース（0個以上）に変換
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])(${flexibleTerm})(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
      } else if (hasJapanese) {
        // 日本語のみの場合
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])(${escapedTerm})(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
      } else {
        // その他の場合は単語境界を使用
        regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      }

      let match;

      // デバッグログを最小限に抑制（パフォーマンス改善）
      const isMultiWordTerm = term.includes(' ') || term.includes('セキュリティ') || /[\u30A0-\u30FF]/.test(term);


      while ((match = regex.exec(text)) !== null) {
        // マッチグループの調整
        let matchText, start, end;

        // 複数単語用語の特別処理
        const multiWordTerms = [
          'Security Groups', 'CloudWatch Logs', 'API Gateway', 'S3 Glacier',
          'S3 Standard', 'S3 Standard-IA', 'Route 53', 'Elastic Beanstalk',
          'Directory Service', 'Secrets Manager', 'Systems Manager',
          'Trusted Advisor', 'Database Migration Service', 'Server Migration Service',
          'Application Discovery Service', 'Cost Explorer', 'License Manager',
          'Personal Health Dashboard', 'Resource Groups', 'Tag Editor',
          'Migration Hub', 'Control Tower', 'Service Catalog', 'Well-Architected Tool'
        ];

        // カタカナ混在用語の特別処理
        const katakanaMixedTerms = [
          'セキュリティグループ', 'VPC ピアリング', 'VPCピアリング',
          'NATゲートウェイ', 'VPCエンドポイント', 'ロードバランサー',
          'オートスケーリンググループ'
        ];

        if (multiWordTerms.includes(term) || katakanaMixedTerms.includes(term)) {
          // 複数単語用語・カタカナ混在用語：シンプルなマッチング
          matchText = match[1];
          start = match.index;
          end = start + match[0].length;
        } else if (hasJapanese && match.length > 2) {
          // 日本語の場合、3番目のグループが実際のマッチ
          matchText = match[2];
          start = match.index + match[1].length;
          end = start + matchText.length;
        } else {
          // 英語の場合、1番目のグループが実際のマッチ
          matchText = match[1] || match[0];
          start = match.index;
          end = start + match[0].length;
        }

        // 既にマッチした範囲と重複していないかチェック
        const isOverlapping = matchedRanges.some(range =>
          (start >= range.start && start < range.end) ||
          (end > range.start && end <= range.end) ||
          (start <= range.start && end >= range.end)
        );

        if (!isOverlapping) {
          matches.push({
            term: matchText,
            start: start,
            end: end,
            originalTerm: term
          });
          matchedRanges.push({ start, end });


        }
      }
    }

    // マッチした用語がない場合は何もしない
    if (matches.length === 0) {
      return 0;
    }

    // マッチした用語を位置順にソート
    matches.sort((a, b) => a.start - b.start);

    // HTMLを構築
    let newHTML = '';
    let lastIndex = 0;

    for (const match of matches) {
      // マッチ前のテキストを追加
      newHTML += text.substring(lastIndex, match.start);

      // ハイライトされた用語を追加
      newHTML += `<span class="aws-term-highlight" data-aws-term="${match.originalTerm}">${match.term}</span>`;

      lastIndex = match.end;
    }

    // 残りのテキストを追加
    newHTML += text.substring(lastIndex);

    // HTMLを置換
    const wrapper = document.createElement('span');
    wrapper.innerHTML = newHTML;

    // 安全チェック：親ノードが存在することを確認
    if (textNode.parentNode) {
      textNode.parentNode.replaceChild(wrapper, textNode);
    } else {
      return matches.length;
    }

    // デバッグログを最小限に抑制（パフォーマンス改善）
    // CloudWatchデバッグログをコメントアウト

    return matches.length;
  }

  // ハイライトを削除
  removeHighlights() {
    const highlights = document.querySelectorAll('.aws-term-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize(); // 隣接するテキストノードを結合
      } else {
        console.warn('親ノードが存在しないため、ハイライトの削除をスキップしました:', highlight.textContent);
      }
    });
  }

  // クリック処理
  handleClick(event) {
    if (!this.enabled || !this.isDataLoaded) return;

    // AWS用語のハイライト要素がクリックされた場合
    if (event.target.classList && event.target.classList.contains('aws-term-highlight')) {
      event.preventDefault();

      // クリックされた単語の情報のみ取得
      const term = event.target.getAttribute('data-aws-term');
      const termData = this.awsTerms[term];

      if (termData) {
        // 単一用語として表示
        this.showTooltip(event, [{ term, data: termData }], true);
      }
    }
    // 他の場所をクリックしてもツールチップは閉じない（×ボタンでのみ閉じる）
  }



  // マウスオーバー処理（ハイライト要素用）
  handleMouseOver(event) {
    if (!this.enabled || !this.isDataLoaded) return;
    // ハイライト要素のスタイルはCSSで処理
  }

  // マウスアウト処理
  handleMouseOut(event) {
    // ツールチップ自体にマウスが移動した場合は非表示にしない
    if (event.relatedTarget && event.relatedTarget.closest('.aws-tooltip')) {
      return;
    }

    // クリックで表示されたツールチップは自動で閉じない
    if (this.tooltip && this.tooltip.dataset.clickOpened === 'true') {
      return;
    }

    this.hideTooltip();
  }

  // AWS用語の検索（単一）
  findAWSTerm(text) {
    for (const [term, data] of Object.entries(this.awsTerms)) {
      // 日本語と英語の両方に対応した境界マッチング
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const hasEnglish = /[A-Za-z]/.test(term);
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term);

      let regex;
      if (hasEnglish && !hasJapanese) {
        regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
      } else if (hasJapanese && hasEnglish) {
        // 英語＋日本語の混在の場合
        const flexibleTerm = escapedTerm.replace(/\\s+/g, '\\\\s*');
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])${flexibleTerm}(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'i');
      } else if (hasJapanese) {
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])${escapedTerm}(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'i');
      } else {
        regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
      }

      if (regex.test(text)) {
        return { term, data };
      }
    }
    return null;
  }

  // 複数のAWS用語を検索
  findMultipleAWSTerms(text) {
    if (!text) return [];

    const foundTerms = [];
    const processedTerms = new Set(); // 重複を避けるため

    for (const [term, data] of Object.entries(this.awsTerms)) {
      // 日本語と英語の両方に対応した境界マッチング
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const hasEnglish = /[A-Za-z]/.test(term);
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term);

      let regex;
      if (hasEnglish && !hasJapanese) {
        regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      } else if (hasJapanese && hasEnglish) {
        // 英語＋日本語の混在の場合
        const flexibleTerm = escapedTerm.replace(/\\s+/g, '\\\\s*');
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])${flexibleTerm}(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
      } else if (hasJapanese) {
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])${escapedTerm}(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
      } else {
        regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      }
      const matches = text.match(regex);

      if (matches && !processedTerms.has(term.toLowerCase())) {
        foundTerms.push({
          term,
          data,
          matchCount: matches.length,
          positions: this.findTermPositions(text, term)
        });
        processedTerms.add(term.toLowerCase());
      }
    }

    // 用語を文章内の出現順序でソート
    foundTerms.sort((a, b) => {
      const aFirstPos = a.positions[0] || 0;
      const bFirstPos = b.positions[0] || 0;
      return aFirstPos - bFirstPos;
    });

    return foundTerms;
  }

  // 用語の位置を検索
  findTermPositions(text, term) {
    const positions = [];

    // 日本語と英語の両方に対応した境界マッチング
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasEnglish = /[A-Za-z]/.test(term);
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term);

    let regex;
    if (hasEnglish && !hasJapanese) {
      regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
    } else if (hasJapanese && hasEnglish) {
      // 英語＋日本語の混在の場合
      const flexibleTerm = escapedTerm.replace(/\\s+/g, '\\\\s*');
      regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])${flexibleTerm}(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
    } else if (hasJapanese) {
      regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])${escapedTerm}(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
    } else {
      regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
    }

    let match;

    while ((match = regex.exec(text)) !== null) {
      // 日本語または混在の場合、マッチ位置の調整が必要
      if ((hasJapanese || (hasJapanese && hasEnglish)) && match.length > 1) {
        positions.push(match.index + match[1].length);
      } else {
        positions.push(match.index);
      }
    }

    return positions;
  }

  // ツールチップの表示（複数用語対応）
  showTooltip(event, awsTerms, isClickEvent = false) {
    this.hideTooltip(); // 既存のツールチップを非表示

    // 配列でない場合は配列に変換
    const termsArray = Array.isArray(awsTerms) ? awsTerms : [awsTerms];
    const isJapanese = this.currentLanguage === 'ja';

    this.tooltip = document.createElement('div');
    this.tooltip.className = `aws-tooltip font-${this.fontSize}`;

    // クリックで開かれた場合はマークを付ける
    if (isClickEvent) {
      this.tooltip.dataset.clickOpened = 'true';
    }

    // ツールチップヘッダー（単一用語表示）
    let tooltipHTML = `
      <div class="aws-tooltip-header">
        <strong>${termsArray[0].term}</strong>
        <span class="aws-tooltip-close">×</span>
      </div>
    `;


    // 単一用語の情報を表示
    const awsTerm = termsArray[0];
    const termData = awsTerm.data[this.currentLanguage];

    tooltipHTML += `
      <div class="aws-tooltip-name">${termData.name}</div>
      <div class="aws-tooltip-description">${termData.description}</div>
    `;

    // 使い勝手情報がある場合は詳細表示
    if (termData.usability) {
      const usability = termData.usability;

      tooltipHTML += `
        <div class="aws-tooltip-usability">
          <div class="pros-cons">
            <div class="pros">
              <strong>${isJapanese ? '👍 メリット' : '👍 Pros'}</strong>
              <ul>
                ${usability.pros.map(pro => `<li>${pro}</li>`).join('')}
              </ul>
            </div>
            <div class="cons">
              <strong>${isJapanese ? '👎 注意点' : '👎 Cons'}</strong>
              <ul>
                ${usability.cons.map(con => `<li>${con}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div class="reviews">
            <strong>${isJapanese ? '💬 ユーザーの声' : '💬 User Reviews'}</strong>
            <div class="review-list">
              ${usability.reviews.map(review => `<div class="review-item">"${review}"</div>`).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // AI生成の明記を追加
    tooltipHTML += `
      <div style="border-top: 1px solid #eee; margin-top: 8px; padding-top: 6px; text-align: center;">
        <small style="color: #888; font-style: italic;">
          ${isJapanese ? '※ この説明はAIによって生成されています' : '※ This description is generated by AI'}
        </small>
      </div>
    `;

    this.tooltip.innerHTML = tooltipHTML;

    // 位置の計算
    const rect = event.target.getBoundingClientRect();
    this.tooltip.style.left = `${rect.left + window.scrollX}px`;
    this.tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;

    document.body.appendChild(this.tooltip);

    // 閉じるボタンのイベントリスナー
    const closeButton = this.tooltip.querySelector('.aws-tooltip-close');
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideTooltip();
    });

    // ツールチップ外クリックで閉じる（少し遅延させて、同じクリックイベントを避ける）
    this.boundDocumentClickHandler = this.handleDocumentClick.bind(this);
    setTimeout(() => {
      document.addEventListener('click', this.boundDocumentClickHandler);
    }, 100);
  }

  // ドキュメントクリック処理（ツールチップ外クリックで閉じる）
  handleDocumentClick(event) {
    // ツールチップ内のクリックは無視
    if (this.tooltip && !this.tooltip.contains(event.target)) {
      // AWS用語のハイライト要素のクリックも無視（新しいツールチップを表示するため）
      if (!event.target.classList || !event.target.classList.contains('aws-term-highlight')) {
        this.hideTooltip();
      }
    }
  }

  // ツールチップの非表示
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
      // ドキュメントクリックイベントリスナーを削除
      if (this.boundDocumentClickHandler) {
        document.removeEventListener('click', this.boundDocumentClickHandler);
        this.boundDocumentClickHandler = null;
      }
    }
  }

  // テーマを適用
  applyTheme() {
    // 既存のテーマクラスを削除
    document.documentElement.classList.remove('aws-theme-light', 'aws-theme-dark');

    if (this.theme === 'light') {
      document.documentElement.classList.add('aws-theme-light');
    } else if (this.theme === 'dark') {
      document.documentElement.classList.add('aws-theme-dark');
    }
    // 'auto'の場合は何もしない（システムのprefers-color-schemeに従う）
  }

  // デバッグ用：用語マッチングをテストする関数（DOM操作なし）
  testTermMatching(testText) {
    console.log('=== Term Matching Test (Japanese Support) ===');
    console.log('Test text:', testText);

    // 日本語対応のソート条件
    const getWordCount = (term) => {
      const trimmed = term.trim();
      const englishWordCount = trimmed.split(/\s+/).length;
      const japaneseSegments = trimmed.match(/[\u3040-\u309F]+|[\u30A0-\u30FF]+|[\u4E00-\u9FAF]+|[A-Za-z0-9]+/g) || [];
      return Math.max(englishWordCount, japaneseSegments.length);
    };

    const sortedTerms = Object.keys(this.awsTerms).sort((a, b) => {
      const aWordCount = getWordCount(a);
      const bWordCount = getWordCount(b);
      if (aWordCount !== bWordCount) {
        return bWordCount - aWordCount;
      }
      return b.length - a.length;
    });

    const multiWordTerms = sortedTerms.filter(term => getWordCount(term) > 1).slice(0, 15);
    console.log('Multi-word terms (top 15):', multiWordTerms);

    const singleWordTerms = sortedTerms.filter(term => getWordCount(term) === 1).slice(0, 10);
    console.log('Single-word terms (top 10):', singleWordTerms);

    // 特定の用語のマッチングテスト
    const testCases = [
      'CloudWatch Container Insights',
      'CloudWatch Insights',
      'CloudWatch Logs',
      'CloudWatch',
      'S3 Glacier Deep Archive',
      'S3 Standard-IA',
      'S3 One Zone-IA',
      'S3 Standard',
      'S3',
      'API Gateway',
      'Route 53',
      'VPC ピアリング',
      'VPCピアリング'
    ];

    console.log('=== Specific Term Matching Test ===');
    testCases.forEach(testCase => {
      const matches = sortedTerms.filter(term =>
        testCase.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(testCase.toLowerCase())
      );
      console.log(`"${testCase}" related terms:`, matches.slice(0, 5));
    });

    const matches = [];
    const matchedRanges = [];

    for (const term of sortedTerms) {
      // 日本語と英語の両方に対応した境界マッチング
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const hasEnglish = /[A-Za-z]/.test(term);
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(term);

      let regex;
      if (hasEnglish && !hasJapanese) {
        regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      } else if (hasJapanese && hasEnglish) {
        // 英語＋日本語の混在の場合
        const flexibleTerm = escapedTerm.replace(/\\s+/g, '\\\\s*');
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])(${flexibleTerm})(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
      } else if (hasJapanese) {
        regex = new RegExp(`(^|[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF])(${escapedTerm})(?=[^A-Za-z0-9\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]|$)`, 'gi');
      } else {
        regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      }

      let match;

      while ((match = regex.exec(testText)) !== null) {
        // 日本語または混在の場合、マッチグループの調整が必要
        let matchText, start, end;
        if ((hasJapanese || (hasJapanese && hasEnglish)) && match.length > 2) {
          // 日本語または混在の場合、3番目のグループが実際のマッチ
          matchText = match[2];
          start = match.index + match[1].length;
          end = start + matchText.length;
        } else {
          // 英語の場合、1番目のグループが実際のマッチ
          matchText = match[1] || match[0];
          start = match.index;
          end = start + match[0].length;
        }

        const isOverlapping = matchedRanges.some(range =>
          (start >= range.start && start < range.end) ||
          (end > range.start && end <= range.end) ||
          (start <= range.start && end >= range.end)
        );

        if (!isOverlapping) {
          matches.push({
            term: matchText,
            start: start,
            end: end,
            originalTerm: term
          });
          matchedRanges.push({ start, end });
          console.log(`Matched: "${term}" at position ${start}-${end}`);
        } else {
          console.log(`Skipped overlapping: "${term}" at position ${start}-${end}`);
        }
      }
    }

    console.log('Final matches:', matches.map(m => m.originalTerm));
    console.log('=== End Test ===');

    return matches;
  }
}

// 拡張機能の初期化
const awsDictionary = new AWSTermsDictionary();

