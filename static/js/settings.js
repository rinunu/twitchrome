
tw.Settings = function(){
    // 画像のインライン表示
    // 通知
    // - TL の新着を通知
    // - DM
    // - Mentions
    
    // RT タイプ
    // 毎回選択
    // 公式
    // 非公式
    
    // 更新間隔
    // - タイムライン
    // - Mentions
    // - DM
    // - リスト
    
    // タイムライン取得数
    // 100
    this.refreshCount = 200;

    // 部分更新間隔
    this.partialInterval = 50;
    
    // 一度の部分更新で表示する件数
    this.partialCount = 2;
    
    // 再送回数
    // 再送間隔
    
    // オートコンプリートを有効にする
    // オートコンプリート表示Delay

    // 検索エンジン
    this.searchResult = tw.YatsResult;
};

