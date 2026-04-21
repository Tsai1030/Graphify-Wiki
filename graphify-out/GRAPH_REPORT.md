# Graph Report - data_markdown  (2026-04-20)

## Corpus Check
- Large corpus: 684 files · ~8,758,528 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 1642 nodes · 3144 edges · 42 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 146 edges (avg confidence: 0.8)
- Token cost: 298,888 input · 224,500 output

## Community Hubs (Navigation)
- [[_COMMUNITY_薪給與動員管理|薪給與動員管理]]
- [[_COMMUNITY_施工材料管制|施工材料管制]]
- [[_COMMUNITY_工地規劃與動線|工地規劃與動線]]
- [[_COMMUNITY_工地零用金|工地零用金]]
- [[_COMMUNITY_工務所設置管理|工務所設置管理]]
- [[_COMMUNITY_工地會議管理|工地會議管理]]
- [[_COMMUNITY_保證金與押標金|保證金與押標金]]
- [[_COMMUNITY_點工與派工管理|點工與派工管理]]
- [[_COMMUNITY_工務所組織管理|工務所組織管理]]
- [[_COMMUNITY_保固維修管理|保固維修管理]]
- [[_COMMUNITY_工地糾紛保險|工地糾紛保險]]
- [[_COMMUNITY_資訊權限與資安|資訊權限與資安]]
- [[_COMMUNITY_臨時水電通風|臨時水電通風]]
- [[_COMMUNITY_估驗計價與竣工|估驗計價與竣工]]
- [[_COMMUNITY_預算與成本管控|預算與成本管控]]
- [[_COMMUNITY_建照與申報|建照與申報]]
- [[_COMMUNITY_採購發包與廠商|採購發包與廠商]]
- [[_COMMUNITY_門禁與進場管制|門禁與進場管制]]
- [[_COMMUNITY_動產抵押擔保|動產抵押擔保]]
- [[_COMMUNITY_竣工報告與檢驗|竣工報告與檢驗]]
- [[_COMMUNITY_品質檢驗管制|品質檢驗管制]]
- [[_COMMUNITY_工程變更協商|工程變更協商]]
- [[_COMMUNITY_安衛環境管理|安衛環境管理]]
- [[_COMMUNITY_防災應變編組|防災應變編組]]
- [[_COMMUNITY_鄰里保護與損鄰|鄰里保護與損鄰]]
- [[_COMMUNITY_工程結算管控|工程結算管控]]
- [[_COMMUNITY_施工計畫與風險|施工計畫與風險]]
- [[_COMMUNITY_完工點交與保固|完工點交與保固]]
- [[_COMMUNITY_資產管理盤點|資產管理盤點]]
- [[_COMMUNITY_復舊與拆移|復舊與拆移]]
- [[_COMMUNITY_工地照明用電|工地照明用電]]
- [[_COMMUNITY_文件管制管理|文件管制管理]]
- [[_COMMUNITY_進度排程管理|進度排程管理]]
- [[_COMMUNITY_下腳料呆料處理|下腳料呆料處理]]
- [[_COMMUNITY_圖說進度排程|圖說進度排程]]
- [[_COMMUNITY_會計稽核簽證|會計稽核簽證]]
- [[_COMMUNITY_建結清圖套繪|建結清圖套繪]]
- [[_COMMUNITY_圖說清圖套繪|圖說清圖套繪]]
- [[_COMMUNITY_湧水處理|湧水處理]]
- [[_COMMUNITY_特殊地質|特殊地質]]
- [[_COMMUNITY_地下管線|地下管線]]
- [[_COMMUNITY_工規處|工規處]]

## God Nodes (most connected - your core abstractions)
1. `工務所` - 93 edges
2. `020207工地會議與管理(104.06.15新編內文)` - 66 edges
3. `010102工務所辦公室設置` - 64 edges
4. `電腦及軟體` - 56 edges
5. `010301 施工場地佈置` - 56 edges
6. `010314 工地臨時水電` - 50 edges
7. `020102 協力廠商估驗及計價` - 45 edges
8. `010309 建管行政` - 43 edges
9. `010302 施工預算規劃暨成本管控` - 42 edges
10. `020208 點工管理` - 41 edges

## Surprising Connections (you probably didn't know these)
- `圖片001` --conceptually_related_to--> `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/img/020205工地糾紛處理(104.06.15新編內文)/001.png → graphify-out/global_concepts.md
- `圖片002` --conceptually_related_to--> `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/img/020205工地糾紛處理(104.06.15新編內文)/002.png → graphify-out/global_concepts.md
- `圖片003` --conceptually_related_to--> `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/img/020205工地糾紛處理(104.06.15新編內文)/003.png → graphify-out/global_concepts.md
- `圖片004` --conceptually_related_to--> `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/img/020205工地糾紛處理(104.06.15新編內文)/004.png → graphify-out/global_concepts.md
- `公告欄與告示牌範例` --references--> `工務所5S整理整頓+1S安全規劃`  [INFERRED]
  data_markdown/img/010102工務所辦公室設置/016.png → graphify-out/global_concepts.md

## Hyperedges (group relationships)
- **業主應辦事項主辦協作** — concept_ab15bd9d11, concept_5d3ba3122c, concept_60e880fe0a [INFERRED 0.82]
- **初期計畫提送協作** — concept_ab15bd9d11, concept_5d3ba3122c, concept_03ac49f9b5 [INFERRED 0.80]
- **安全衛生報備作業** — concept_ab15bd9d11, concept_60e880fe0a, concept_db0add097e [EXTRACTED 1.00]
- **開工初期會議與分派** — concept_f196d5c8f5, concept_95766a9cb4, concept_f0246c5c39, concept_d54f550d08, concept_ab15bd9d11 [INFERRED 0.84]
- **對業主應辦事項授權與提報** — concept_ab15bd9d11, concept_73e50d3c41, concept_1c7bc9e180, concept_c6266c98f5 [INFERRED 0.80]
- **初期計畫文件群** — concept_9cb3a4e1f4, concept_8425b9cf3b, concept_e450fac4fa, concept_24c6b3f332, concept_2d6c58ded3 [INFERRED 0.83]
- **契約用印前檢核分工** — concept_2e460aa0c9, concept_ab15bd9d11, concept_73e50d3c41, concept_f8c246d997 [INFERRED 0.86]
- **標前協議權限鏈** — concept_82f66b4095, concept_d54f550d08, concept_f0246c5c39 [INFERRED 0.78]
- **覓地自建流程** — concept_708d0323ed, concept_1522924019, concept_ceeca912ca [INFERRED 0.80]
- **房屋租用流程** — concept_4f80fb8758, concept_1522924019, concept_ee61ee58e3, concept_bba4fc97d2 [INFERRED 0.82]
- **工務所5S與安全管理** — concept_5s_1s_174d24165f, concept_1s_69ff4eff1b, concept_698b22dc02, concept_f5cfddab77 [INFERRED 0.85]
- **覓地自建流程參與單位** — concept_1484c0c1fd, concept_ab15bd9d11, concept_f8c246d997, concept_a15f72d0c3, concept_5d3ba3122c [EXTRACTED 1.00]
- **房屋租用流程參與單位** — concept_aefd903cd8, concept_ab15bd9d11, concept_f8c246d997, concept_a15f72d0c3, concept_5d3ba3122c [EXTRACTED 1.00]
- **工務所5S與安全管理** — concept_5s_3232fec989, concept_1s_c66c45355d, concept_ab15bd9d11, concept_5d3ba3122c, concept_60e880fe0a [INFERRED 0.82]
- **工務所組織提報作業流程** — concept_c7641bbb7f, concept_7ffadba018, concept_99561c0420, concept_0787fd7bce [EXTRACTED 1.00]
- **工務所提報組織表填寫控制** — concept_c7641bbb7f, concept_7ffadba018, concept_99561c0420, concept_b7588deb1f [EXTRACTED 1.00]
- **人力需求提出與初核** — concept_ab15bd9d11, concept_5d3ba3122c, concept_85f1243eda, concept_e0263979f2 [INFERRED 0.87]
- **工地人員管理核心控制** — concept_b12131165b, concept_8663d4758a, concept_0f75773386, concept_f0fdb42cae [INFERRED 0.84]
- **工地週轉金申請作業** — concept_ab15bd9d11, concept_77ab48baaa, concept_eef01c3968, concept_ade24d3d12, concept_7f64331d2d, concept_78dbfc635b, concept_79047b2d99 [EXTRACTED 1.00]
- **工地銀行戶頭開戶作業** — concept_9138f9383e, concept_eef01c3968, concept_4e61e1f0f6, concept_79047b2d99, concept_c1bb7727b7 [EXTRACTED 1.00]
- **週轉金查核管理** — concept_8b273b82da, concept_77ab48baaa, concept_ab15bd9d11, concept_cf3d3573a5 [EXTRACTED 1.00]
- **零用金報銷作業** — concept_ec8c704b42, concept_8ad73e1b78, concept_b714861ebd, concept_890a32bd9d, concept_5033c65526 [EXTRACTED 1.00]
- **請款回補作業** — concept_7f64331d2d, concept_aa8987bfea, concept_5033c65526 [EXTRACTED 1.00]
- **支付保證金作業** — concept_ab15bd9d11, concept_b2ffd39a17, concept_03ac49f9b5, concept_49eb651355, concept_b678cd1f6d [EXTRACTED 1.00]
- **小額保證金零用金支付作業** — concept_ab15bd9d11, concept_a4494cbd63, concept_b678cd1f6d, concept_b2ffd39a17 [EXTRACTED 1.00]
- **收回保證金作業** — concept_ab15bd9d11, concept_bfcba02061, concept_b2ffd39a17, concept_03ac49f9b5 [EXTRACTED 1.00]
- **購置及維修申請作業群** — concept_ab15bd9d11, concept_ed73dfe118, concept_37a6a15385 [EXTRACTED 1.00]
- **使用權限申請作業群** — concept_ab15bd9d11, concept_ed73dfe118, concept_0aaa91df5d [EXTRACTED 1.00]
- **資訊系統修改及服務申請作業群** — concept_ab15bd9d11, concept_ed73dfe118, concept_cb720b994c [EXTRACTED 1.00]
- **電話管理流程** — concept_6d1b24b46e, concept_99561c0420, concept_167f13d529, concept_b616a2399d, concept_f9494be240, concept_f10aa38b67 [EXTRACTED 1.00]
- **請購簽核與系統作業** — concept_6d1b24b46e, concept_8764a37218, concept_eip_f24aaff8ae, concept_5d3ba3122c [EXTRACTED 1.00]
- **電話資產管理** — concept_ab15bd9d11, concept_3736dda11e, concept_f9494be240, concept_beac5c9157 [INFERRED 0.82]
- **資產購置與驗收鏈** — concept_f55d8d2975, concept_9785d06c7d, concept_8e0311fa43, concept_ead8029816 [INFERRED 0.86]
- **盤點與資料更新鏈** — concept_684d66ad38, concept_3a0d36c77c, concept_ead8029816, concept_32db86f3f1 [INFERRED 0.84]
- **報廢與處分鏈** — concept_c111b42f61, concept_190cfef465, concept_076bd5cae0, concept_ead8029816 [INFERRED 0.87]
- **施工前準備作業群** — concept_d63181ca35, concept_25b2ea57a9, concept_3a25754395, concept_f9240d6048, concept_a26d621a0f [INFERRED 0.88]
- **臨時設施配置群** — concept_73155d0967, concept_9422dcb776, concept_055815e548, concept_17634832b7, concept_d1b1a301dd [EXTRACTED 1.00]
- **現況調查與備查群** — concept_3b468a2110, concept_95a2490b97, concept_879df399bf, concept_dcdb67bf11 [EXTRACTED 1.00]
- **現場安全管理群** — concept_79eb04bacc, concept_82d2556a80, concept_7988b41e0c, concept_f5cfddab77, concept_e7d1f125dd, concept_a24b47a73a [INFERRED 0.84]
- **施工預算編製與核定** — concept_3c0b63e2c7, concept_ab15bd9d11, concept_fedf47111a, concept_0821539f4c [EXTRACTED 1.00]
- **成本差異管控** — concept_ab15bd9d11, concept_3c0b63e2c7, concept_923e844f68, concept_a344a49a49 [INFERRED 0.84]
- **材料設備品質管制流程** — concept_91aeb453c2, concept_ff762e3f7a, concept_5b16e5a0bf, concept_b4ed9c0d4b, concept_1dedbe6651 [EXTRACTED 1.00]
- **權責層級** — concept_c1285e4d83, concept_79cefc4650, concept_11e08e83b4, concept_838162ee3d, concept_9d61a2f2e7 [EXTRACTED 1.00]
- **檢(試)驗與不合格處理** — concept_164172c3b3, concept_319cf84439, concept_hold_point_98af067a5d [EXTRACTED 1.00]
- **工務所每日安衛管理循環** — concept_5a97b80a33, concept_2ee31b38ac, concept_9b1b71f043 [INFERRED 0.84]
- **工地安全衛生協議組織會議** — concept_f4ac3a71ec, concept_90cb105dae, concept_d7bbb9edcf [INFERRED 0.72]
- **安衛管理文件體系** — concept_f22d69fd6a, concept_017bfafa5a, concept_bf802b0fe2, concept_606d518161, concept_4f33ceef6e [EXTRACTED 1.00]
- **人員進場管制作業鏈** — concept_c50f1599cb, concept_2f9c20247b, concept_4a653bebc0, concept_efdd1d10a0 [INFERRED 0.91]
- **車輛機具進場管制作業鏈** — concept_a1544d645e, concept_bbc3079973, concept_7bf36b5d7d, concept_604c7b1d4c [INFERRED 0.86]
- **危險性機械查核** — concept_7988b41e0c, concept_bff215d0a4, concept_604c7b1d4c [INFERRED 0.84]
- **工地施工動線規劃的基本條件** — concept_1847ef72c5, concept_1821be83f1, concept_41cd716632 [INFERRED 0.86]
- **施工動線協調機制** — concept_ab15bd9d11, concept_f40853adbd, concept_e7e739664a, concept_8da6ba2168 [EXTRACTED 1.00]
- **工地出入口管制** — concept_7710771201, concept_055815e548, concept_72caeb2871 [INFERRED 0.84]
- **工地環境維護** — concept_9b593d0b13, concept_5d7cd9890b, concept_05b72c3967 [INFERRED 0.80]
- **臨時照明建置與運作** — concept_2002792363, concept_f45a14ad2b, concept_e1d721b71d, concept_4af7d3b75e, concept_8daaa3b0d4, concept_ff5bd9c08c, concept_f1c7c5e6f0 [INFERRED 0.94]
- **工地防火作業流程要素** — concept_ab15bd9d11, concept_ab48e87bd4, concept_6a4879175e [INFERRED 0.82]
- **工地防汛作業流程要素** — concept_ab15bd9d11, concept_c7fa870d9b, concept_94ed9e96b9 [INFERRED 0.82]
- **建管行政主要流程** — concept_22d59e89d3, concept_465a2499f5, concept_e2e5e8391b, concept_3909bf1033, concept_44768bee26 [EXTRACTED 1.00]
- **開工申報角色組合** — concept_93d7dd965e, concept_54c7468e0c, concept_e471fdfa28, concept_22d59e89d3 [EXTRACTED 1.00]
- **勘驗角色組合** — concept_54c7468e0c, concept_e471fdfa28, concept_465a2499f5, concept_e2e5e8391b [EXTRACTED 1.00]
- **施工前鄰里保護準備** — concept_8c8b14a424, concept_ed6b0b161d, concept_9a4fc3c62a, concept_4e08021a34, concept_fb098d0873 [INFERRED 0.90]
- **敦親睦鄰推動角色** — concept_8ad73e1b78, concept_834b80571e, concept_55a32dd547 [EXTRACTED 1.00]
- **施工中環境與安全控制** — concept_b67ac3e893, concept_b81ac20add, concept_96049527ef, concept_c5e6143e30, concept_6263f7e352 [INFERRED 0.88]
- **七合一整合性進度表構成項目** — concept_4a3889d073, concept_c6be65adbe, concept_fbcd6c336c, concept_a37b2a4ec3, concept_440bc8073f, concept_ab3a92259e, concept_d01be6022f [EXTRACTED 1.00]
- **七合一進度管理執行流程** — concept_05cfb9fe95, concept_8b69b4b7ed, concept_8de75199c0 [INFERRED 0.86]
- **備標到投標流程** — concept_3f4b8ac01d, concept_0f22889347, concept_4f573b53b9 [EXTRACTED 1.00]
- **得標後施工計畫編製** — concept_555ae0e577, concept_f912922172, concept_8e72de9039 [EXTRACTED 1.00]
- **施工期間管控與知識沉澱** — concept_1e064a3e4b, concept_1a6b99a577, concept_15da178d99 [EXTRACTED 1.00]
- **建築施工圖主要流程** — concept_73095d63c8, concept_d7867c013d, concept_bim_fdf6e6bc63, concept_1f_1428f33794, concept_c26e6c9f75, concept_c261943f0c, concept_0c11200d71, concept_54a8719b2e, concept_po_erp_6191ab57b3 [EXTRACTED 1.00]
- **土木施工圖主要流程** — concept_73095d63c8, concept_7179f02b87, concept_299077b4ab, concept_6347348535, concept_54a8719b2e, concept_po_erp_6191ab57b3 [EXTRACTED 1.00]
- **臨時用電申請文件與流程** — concept_87cbd57e2f, concept_021e74cbdf, concept_93aa53a576 [EXTRACTED 1.00]
- **臨時用水申請文件與流程** — concept_89413ef5e3, concept_f73f9fdedd, concept_557f632566 [EXTRACTED 1.00]
- **臨時水電維護責任** — concept_b372163dcc, concept_6395ffbeb6, concept_506f9e406a [INFERRED 0.82]
- **工地臨時水電五大系統** — concept_4c14f16767, concept_b76ca6807a, concept_eec8f9838a [INFERRED 0.80]
- **文件制訂／修訂／廢止流程** — concept_ac00ae0af4, concept_e7212eda63, concept_69e6735f70, concept_0a2f1e6ab9 [EXTRACTED 1.00]
- **文件編號與版本管理** — concept_ffa3e757e1, concept_4a26926ff0, concept_e7212eda63, concept_aa308c4c49 [INFERRED 0.86]
- **文件保存與分發控制** — concept_000e7f780e, concept_aa308c4c49, concept_f665e17a31 [INFERRED 0.84]
- **管理時間表製作與審核流程** — concept_856c882a55, concept_c1906e27d4, concept_df4617c6a7, concept_fc9713795e, concept_5d3ba3122c [EXTRACTED 1.00]
- **時間表內容要素** — concept_df4617c6a7, concept_5bf25b0015, concept_c8fa9c30fe, concept_7399d3185f [EXTRACTED 1.00]
- **紀律與執行管控** — concept_c6ed98344e, concept_7ae761f306, concept_7010dd086c, concept_c1906e27d4 [EXTRACTED 1.00]
- **一級採購案件作業** — concept_cdad1954c4, concept_68aebba1d8, concept_6e599bcd53, concept_e2d4113354 [EXTRACTED 1.00]
- **二級以上採購案件作業** — concept_12143795f8, concept_68aebba1d8, concept_6e599bcd53, concept_e2d4113354, concept_5ed64bacc3 [EXTRACTED 1.00]
- **決標權責分級** — concept_98c1cdbe52, concept_f8df646328, concept_dda2182a6c, concept_d54f550d08, concept_bb356e98b2 [EXTRACTED 1.00]
- **估驗計價標準流程－公司支付** — concept_8e973fa27a, concept_a00961fcd3, concept_12bb6488ad [INFERRED 0.82]
- **工務所支付流程** — concept_886159f0bf, concept_c5b13be487, concept_24ffd7fa8e [EXTRACTED 1.00]
- **材料供借與扣款控制** — concept_3efd454c87, concept_8d78e6067c, concept_29b0ab04aa [INFERRED 0.80]
- **採購案件押標金處理** — concept_c1086ae4bb, concept_d9680e45c7, concept_184a71333c [INFERRED 0.86]
- **工程保證開立與完繳** — concept_91756bdc16, concept_b00503835c, concept_c3a23614ea [INFERRED 0.84]
- **保固金退還作業** — concept_cf6363ebeb, concept_7490f07237, concept_c69b0cc906 [INFERRED 0.85]
- **監督付款審查與核定** — concept_f8c246d997, concept_b2ffd39a17, concept_03ac49f9b5, concept_efe2b344de [EXTRACTED 1.00]
- **監督付款銀行作業** — concept_3381490538, concept_165e171367, concept_08abd5ac8f, concept_b112949e91 [EXTRACTED 1.00]
- **監督付款相關角色** — concept_ab15bd9d11, concept_8b1170772e, concept_20f2996b82 [EXTRACTED 1.00]
- **新廠商登記作業** — concept_4859676af0, concept_0d64bd39a9, concept_b39035198c, concept_0166f6e26d, concept_1e814c9bf0 [EXTRACTED 1.00]
- **施工中定期考核作業** — concept_cb6409e54c, concept_ab15bd9d11, concept_ca5ebf76b6, concept_b520205452 [EXTRACTED 1.00]
- **評鑑與獎懲機制** — concept_f4db85ad51, concept_b7367ab758, concept_19ade7fe55, concept_1e814c9bf0 [INFERRED 0.82]
- **業主估驗計價權責分工** — concept_392a30cfad, concept_3d07cefd21, concept_888af9d4ea, concept_71ef099b05, concept_8ad73e1b78 [EXTRACTED 1.00]
- **停留點與自主檢查作業** — concept_eb44db22e6, concept_84de5f80ae, concept_acba03cd4f, concept_392a30cfad [EXTRACTED 1.00]
- **計價送審與入帳流程** — concept_29b0ab04aa, concept_887ca5863b, concept_3ba7dff95a, concept_acba03cd4f, concept_888af9d4ea [EXTRACTED 1.00]
- **擔保品建檔與管制文件** — concept_651b235a31, concept_abe6508d58, concept_9ba58172da, concept_d102b85ee0 [INFERRED 0.86]
- **抵押設定與後續保管** — concept_9c5417e7c2, concept_309ccf555d, concept_5a4178a723, concept_792b425fce [INFERRED 0.84]
- **進場驗收與影像建檔** — concept_6393b9010d, concept_1b354a4e10, concept_651b235a31 [INFERRED 0.82]
- **變更設計處理主流程** — concept_7eb01cc593, concept_ab15bd9d11, concept_e815d437df, concept_98c4cd7a3d [INFERRED 0.86]
- **先行施作核准鏈** — concept_c35eb79f1e, concept_5d3ba3122c, concept_e815d437df, concept_ab15bd9d11 [EXTRACTED 1.00]
- **議價文件鏈** — concept_b8bcf7e6d4, concept_5c8dd8427e, concept_eb91238300 [INFERRED 0.78]
- **鋼筋進場控制** — concept_f2abb93e4b, concept_624118c110, concept_def0b8e4b2, concept_1d42043c4c, concept_90764c0be9 [INFERRED 0.89]
- **包商領退料管理** — concept_52b957970b, concept_14d06b2f95, concept_08a517e937, concept_888af9d4ea, concept_d2347936ab [INFERRED 0.86]
- **盤點與異常追蹤** — concept_268e935d1a, concept_34feab0ef4, concept_1436783509, concept_3c0b63e2c7, concept_d2347936ab [INFERRED 0.84]
- **呆料處理作業** — concept_3de6b1512a, concept_ba5b696833, concept_511d3c916f [INFERRED 0.83]
- **廢料處理作業** — concept_394854a3d4, concept_c972cd6eff, concept_ab15bd9d11 [INFERRED 0.83]
- **下腳料變賣報繳作業** — concept_daf491a4a7, concept_1d9c88e49d, concept_18269792b9, concept_7b58fefd99, concept_263965366d [INFERRED 0.87]
- **七合一進度管控主線** — concept_1e90f3fb17, concept_557f212107, concept_ab0a88c091, concept_04498513e2, concept_460120ac5b, concept_6560feed91, concept_37589e8b39 [INFERRED 0.90]
- **落後處置與契約管理** — concept_ab15bd9d11, concept_28f4f47707, concept_460120ac5b, concept_6560feed91, concept_0166f6e26d, concept_5af4ed54d2, concept_37589e8b39 [INFERRED 0.88]
- **工地糾紛現場處置** — concept_5fb7123ea1, concept_79cefc4650, concept_c8bac504e8 [EXTRACTED 1.00]
- **重大糾紛支援處理** — concept_049d0f257b, concept_c447d61495, concept_0b0d7489c5 [EXTRACTED 1.00]
- **和解與調解文件** — concept_927592221b, concept_c91920e143, concept_ccaba6003b [EXTRACTED 1.00]
- **業主爭議處理鏈** — concept_e815d437df, concept_ab15bd9d11, concept_f8c246d997, concept_dfd61ab4ff, concept_c735af4466 [INFERRED 0.86]
- **協力廠商爭議處理鏈** — concept_7190bcd05f, concept_ab15bd9d11, concept_f8c246d997, concept_12728a6d72 [INFERRED 0.85]
- **索賠證據鏈** — concept_c47ddc0220, concept_7621f41db5, concept_3af75ee43c, concept_59cb079654 [INFERRED 0.83]
- **每日例行會議** — concept_129e261bca, concept_83a001dcb8, concept_0568e52852, concept_6671082a66 [EXTRACTED 1.00]
- **每週每月會議** — concept_d7700983e7, concept_676cc9bf0d, concept_f48d1efbe5 [INFERRED 0.73]
- **會議紀錄管理** — concept_4a9f2e40b5, concept_google_4c10530ba6, concept_fc1912777d [EXTRACTED 1.00]
- **點工管理主流程** — concept_5457908114, concept_6f5cb0460d, concept_42966816b7 [INFERRED 0.86]
- **點工前置管控** — concept_7e9e7f9bc7, concept_7d78d60a44, concept_d06856ce0d [INFERRED 0.84]
- **資料留存與統計** — concept_26d25ecf94, concept_po_erp, concept_d34c3e89a1 [INFERRED 0.90]
- **責任與扣款管理** — concept_228110fdd5, concept_9563c73b1c, concept_17f812d930 [INFERRED 0.82]
- **零星機具租賃作業流程** — concept_890b0a82e9, concept_7c6b229791, concept_42966816b7, concept_0c01f5fc8c, concept_26d25ecf94, concept_d05749e702 [INFERRED 0.88]
- **現場使用控制與安全查核** — concept_031b469caf, concept_7b2cc948f0, concept_0c01f5fc8c, concept_c1906e27d4 [INFERRED 0.84]
- **統計與計價資料鏈** — concept_po_erp, concept_d611c60a5b, concept_d05749e702, concept_35d4392405 [INFERRED 0.86]
- **施工日誌填報與審核流程** — concept_9d61a2f2e7, concept_031ded7abd, concept_9da5af62a4, concept_76fef7109d, concept_888af9d4ea [EXTRACTED 1.00]
- **施工照片管理流程** — concept_9d61a2f2e7, concept_f3e0859b60, concept_02ce53ce4a, concept_88e27b3de2 [EXTRACTED 1.00]
- **特殊狀況拍照存證適用情境** — concept_0e25784c40, concept_408819d42c, concept_6b54483890, concept_9dc94b0c4f [EXTRACTED 1.00]
- **鄰損第一時間處理** — concept_ab15bd9d11, concept_dd5e9c0b0a, concept_1312a4b48d [EXTRACTED 1.00]
- **出險與理賠處理** — concept_ab15bd9d11, concept_6d4daee492, concept_5daa5c50ab [EXTRACTED 1.00]
- **和解與列管撤銷** — concept_ab15bd9d11, concept_ccaba6003b, concept_6454d17d0a [EXTRACTED 1.00]
- **完成品保護措施四原則** — concept_72b145fe7f, concept_79eb04bacc, concept_800f0c07a9 [INFERRED 0.74]
- **點交文件組合** — concept_042a083e9c, concept_8852c48e92, concept_ba0cce6a01 [EXTRACTED 1.00]
- **竣工前復舊規劃** — concept_77ab9c1d55, concept_f0cb31dfed, concept_565fea5f8d [INFERRED 0.82]
- **竣工後驗收點交** — concept_5a654be6bf, concept_a9ac91d1fc, concept_565fea5f8d [INFERRED 0.79]
- **承包商復舊責任控管** — concept_4bf98465c5, concept_fbf5fd22c7, concept_565fea5f8d [INFERRED 0.77]
- **竣工報告書編製流程** — concept_0d0666dbd3, concept_ee101b6e5c, concept_253167719c, concept_a2ef63a066, concept_e8a392137e, concept_a6b80ae738, concept_73c1e6c670 [EXTRACTED 1.00]
- **竣工報告書會審與核定** — concept_5d3ba3122c, concept_a15f72d0c3, concept_3c0b63e2c7, concept_d35487ffde, concept_b2ffd39a17, concept_a07363dd6a [EXTRACTED 1.00]
- **竣工報告書章節架構** — concept_75b084238a, concept_fbcd6c336c, concept_28beb103bf, concept_8bb8a7097e, concept_a52e400c70, concept_6940c33ebc, concept_6e1eaa3c53 [EXTRACTED 1.00]
- **施工成效控制主題** — concept_c06da0ae4e, concept_1c3a3f92b0, concept_ce93f074ce [INFERRED 0.78]
- **分包商採購合約結算文件群** — concept_5fe8d3004d, concept_303d0be36e, concept_e5896923af, concept_a0cef5d398 [INFERRED 0.90]
- **工令結算報告文件群** — concept_e837cb33b2, concept_02c342b3f5, concept_28aa8cc47d, concept_3f902ec6c9 [EXTRACTED 1.00]
- **保固作業交接** — concept_4cbe83c771, concept_256fccc9b5, concept_316d2795c4 [INFERRED 0.78]
- **解除保固前流程** — concept_4f076785a4, concept_0166f6e26d, concept_fa43d2a9dc [INFERRED 0.82]
- **高雄捷運進場管制** — concept_r11_4e60687a74, concept_f99c308c18, concept_c7dc10b1f2, concept_60a95761e1 [INFERRED 0.84]

## Communities

### Community 0 - "薪給與動員管理"
Cohesion: 0.03
Nodes (130): 工作同仁薪給管理要點, 財務處, 動員開工作業檢核表, 鄉里訪談, 銀行內部轉帳, 初期採發案件, 勞健保, 專案專卷管理 (+122 more)

### Community 1 - "施工材料管制"
Cohesion: 0.03
Nodes (110): 預開發票申請, 施工照片共用資料夾, 工程日報表, 包商領料單, 特殊狀況拍照存證, 大宗材料管理, 完成工項審驗, 盤點記錄 (+102 more)

### Community 2 - "工地規劃與動線"
Cohesion: 0.04
Nodes (97): 洗車台, 飲水機, 周邊鄉里造訪溝通, 施工流程順序, 沉砂池, 施工計畫及期程, 契約法規, 工地施工動線規劃作業檢核表 (+89 more)

### Community 3 - "工地零用金"
Cohesion: 0.05
Nodes (74): 圖片001, 圖片004, 圖片007, 圖片015, 零用金運用及核銷, 工地保管人, 董事長親簽, 工務所零用金保管人 (+66 more)

### Community 4 - "工務所設置管理"
Cohesion: 0.04
Nodes (61): 合約修改協商, 急救箱, 1S安全區隔, 租賃合約, 會議室, 緊急應變系統, 房屋租用, 擔架 (+53 more)

### Community 5 - "工地會議管理"
Cohesion: 0.05
Nodes (34): 圖 020 週會流程圖, 圖 026 月會流程圖, 圖 034 其他會議流程圖, 動線會議, 列管事項, 其他會議（不定期）, 早會, 主管裁示 (+26 more)

### Community 6 - "保證金與押標金"
Cohesion: 0.06
Nodes (61): 010107 水電費、電信費、及房租等存出保證金管理, 發還（換抵）押標金／履約保證金（品）申請單, 履約保證品, 管理部法務處, 保證金收回與沖減銀行保證金科目, 工務所承辦人員, 工程週轉金請款單, 保證金繳交及退還作業流程 (+53 more)

### Community 7 - "點工與派工管理"
Cohesion: 0.07
Nodes (60): 圖片005, 圖片012, 假冒人頭與人數灌水, 勤前教育與危害告知, 機具使用簽認單, 零星機具租賃, 簽約廠商計價與資料統計彙整, 派工簽認單（三聯單） (+52 more)

### Community 8 - "工務所組織管理"
Cohesion: 0.07
Nodes (59): 工務所紀律規範, 施工管理, 中華工程公司工務所組織調整／主管異動報核表, 採購, 工務所組織要點, 工務所負責人, 時間表修正, 電話管理 (+51 more)

### Community 9 - "保固維修管理"
Cohesion: 0.07
Nodes (59): 切結書, 落後原因檢討改進, 履約協商, 七合一工項計畫期程, 協力廠商名冊, 廠商, 保固及維修作業檢核表, 解除合約另行發包 (+51 more)

### Community 10 - "工地糾紛保險"
Cohesion: 0.06
Nodes (52): 重大糾紛, 重大事件速報表, 復工申請表, 專業技師及工規處, 工地常見糾紛案例, 土木技師公會鑑定申請書, 營造工程第三人意外責任險, 出險通知單 (+44 more)

### Community 11 - "資訊權限與資安"
Cohesion: 0.07
Nodes (53): 保密協定, 使用權限申請流程, 企業入口網站, 硬體, 財務及非財務資訊之管理作業要點, 購置及維修申請（電子表單）, 軟體, 請購單系統 (+45 more)

### Community 12 - "臨時水電通風"
Cohesion: 0.06
Nodes (50): 圖片002 流程圖, 圖片019 通風設置, 臨時用電應備文件, 圖片024 事故案例, 苗栗大安隧道氣爆事故, 工地視訊, 臨時電, 甲種電匠 (+42 more)

### Community 13 - "估驗計價與竣工"
Cohesion: 0.08
Nodes (42): 客變圖, 1F 高程檢討與開挖圖面, 工作圖, 計價資料, 計價缺口（差異）, 驗收與催尾款, 施工站, 計價發票 (+34 more)

### Community 14 - "預算與成本管控"
Cohesion: 0.06
Nodes (26): 施工預算, 變更管理, 成本差異流程, 紅燈警訊列管, 會計月報, 施工預算規劃暨成本管控, 成本控制, 直接成本 (+18 more)

### Community 15 - "建照與申報"
Cohesion: 0.08
Nodes (27): 雜項執照, 建管行政, 勘驗報告書, 使用執照, 申報開工, 申請使用執照, 開工、竣工展期申報, 放樣勘驗 (+19 more)

### Community 16 - "採購發包與廠商"
Cohesion: 0.1
Nodes (40): 圖片002, 廠商基本資料表, 工務所辦理二級以上採購案件流程, 停權與拒絕往來處置, 採購發包處, 廠商登記、提名、考核、獎懲及評鑑, 開標與決標, 新廠商登記流程 (+32 more)

### Community 17 - "門禁與進場管制"
Cohesion: 0.09
Nodes (39): 帽貼, 工地門禁, 車輛／施工材料進出場記錄, 危害告知, 固定圍籬及警告標示, 紀律承諾書, 工務所工作場地門禁管制辦法, 現場工程師／安衛人員 (+31 more)

### Community 18 - "動產抵押擔保"
Cohesion: 0.11
Nodes (39): 核定決標, 擔保方式與金額, 拍照存證建檔, 動產抵押權契約書, 總公司工程事業群主管處, 文件移交與保管, 擔保品進場、清點, 動產抵押擔保品清冊 (+31 more)

### Community 19 - "竣工報告與檢驗"
Cohesion: 0.1
Nodes (38): 資料蒐集, 材料檢驗流程, 結算驗收證明書及結算明細表, 材料進場檢驗流程, 工率檢討, 大綱訂定, 施工材料, 竣工報告書編撰綱要 (+30 more)

### Community 20 - "品質檢驗管制"
Cohesion: 0.1
Nodes (38): 品管站站長, 檢(試)驗, 材料設備檢(試)驗結果管制作業, 材料設備管制總表（附表一）, 不合格品管制程序, 品質管理標準表（附表三）, 材料設備檢(試)驗作業流程, 工務所所長／副所長 (+30 more)

### Community 21 - "工程變更協商"
Cohesion: 0.09
Nodes (38): 圖片021, 採購法第 22 條第 6 款, 爭議管理, 議價底限, 法務部門, 變更設計管理, 監造單位, 工期展延 (+30 more)

### Community 22 - "安衛環境管理"
Cohesion: 0.1
Nodes (36): 交通維持計畫, 施工前危害告知, 安全衛生協議組織會議, 內部稽核, 安衛管理, 丁類場所危險性工作場所評估計畫書（危評計畫）, 工務所每日安衛管理循環, 施工環境保護執行計畫 (+28 more)

### Community 23 - "防災應變編組"
Cohesion: 0.08
Nodes (35): 防火安全距離, 工地防災作業檢核表, 醫療組, 總指揮, 交通組, 防災資源列冊建檔, 災害防救執行暨防颱防汛計畫, 電氣火災之防制對策 (+27 more)

### Community 24 - "鄰里保護與損鄰"
Cohesion: 0.12
Nodes (35): 鄰里保護及敦親睦鄰, 臺北市建築施工損鄰事件爭議處理規則, 施工中的防治與監測作業, 地政單位, 基地調查, 敦親睦鄰與施工前說明會, 鄰里保護及敦親睦鄰作業檢核表, 安全監測數據檢討 (+27 more)

### Community 25 - "工程結算管控"
Cohesion: 0.11
Nodes (32): 工程結算表, 會計報表, 協力廠商結算管控表, 企業資源處, 業主工程結算驗收證明書, 協力廠商結算, 資源供借結償表, 工務處及估算成控處 (+24 more)

### Community 26 - "施工計畫與風險"
Cohesion: 0.13
Nodes (28): 工法、工序、風險評估, 知識庫建檔, 結案報告資料收集, 施工中查核與檢討, 設施工程分項施工計畫, 備標階段, 服務建議書, 標案風險評估表 (+20 more)

### Community 27 - "完工點交與保固"
Cohesion: 0.12
Nodes (28): 設施設備點交清冊, 保固時程, 石材／地磚／門框／窗框／電梯／衛浴設備保護, 消防系統, 完成品保護與點交, 機電系統實質完工, 給排水系統, 完成品保護 (+20 more)

### Community 28 - "資產管理盤點"
Cohesion: 0.15
Nodes (26): 變賣, 固定／列管資產損毀報廢單, 資產保管責任, 資產清點暨使用狀況表, 固定資產, 資產標誌, 定期盤點, 資產驗收單 (+18 more)

### Community 29 - "復舊與拆移"
Cohesion: 0.17
Nodes (22): 特殊用地復舊, 復舊完成切結書, 施工場地復舊, 會勘（點交）紀錄, 工務所管理作業手冊, 地主要求與契約不符, 租賃契約檢閱與規劃, 管線機構 (+14 more)

### Community 30 - "工地照明用電"
Cohesion: 0.19
Nodes (21): 圖片003, 照度表, 漏電斷路器, 臨時照明, 燈具、設備及材料選擇, 臨時電 / 鄰房借電 / 租用發電機, 燈具選型原則, 臨時電纜線拉線作業 (+13 more)

### Community 31 - "文件管制管理"
Cohesion: 0.19
Nodes (21): 文件管理系統, 文件異動會簽單, 文件檔案夾與檔案側標籤, 版本管理, 工地主管, 管制文件, 作業單位, 文件管理人員 (+13 more)

### Community 32 - "進度排程管理"
Cohesion: 0.21
Nodes (20): 七合一進度管理, 七合一整合性進度表, 採購發包, 施工進度, 七合一進度表版面示意, 甘特圖, 七合一進度定期檢討示意, 各單位確認與簽核執行 (+12 more)

### Community 33 - "下腳料呆料處理"
Cohesion: 0.23
Nodes (20): 存解繳款事項清單, 下腳料, 銀行匯款資料, 標售或比價, 公司, 下腳料清單與估價資料, 廢料處理流程, 呆料處理流程 (+12 more)

### Community 34 - "圖說進度排程"
Cohesion: 1.0
Nodes (2): 施工圖說清單列表與進度排程, 七合一進度表

### Community 35 - "會計稽核簽證"
Cohesion: 1.0
Nodes (1): 會計處、稽核室或簽證會計師

### Community 36 - "建結清圖套繪"
Cohesion: 1.0
Nodes (1): 建築、結構清圖套繪

### Community 37 - "圖說清圖套繪"
Cohesion: 1.0
Nodes (1): 圖說清圖套繪

### Community 38 - "湧水處理"
Cohesion: 1.0
Nodes (1): 湧水

### Community 39 - "特殊地質"
Cohesion: 1.0
Nodes (1): 特殊地質

### Community 40 - "地下管線"
Cohesion: 1.0
Nodes (1): 地下管線

### Community 41 - "工規處"
Cohesion: 1.0
Nodes (1): 工規處

## Ambiguous Edges - Review These
- `各類型教育訓練照片` → `教育訓練`  [AMBIGUOUS]
  data_markdown/010304安衛管理(104.11.27編修內文).md · relation: AMBIGUOUS
- `消防急救與現場安全教育照片` → `教育訓練`  [AMBIGUOUS]
  data_markdown/010304安衛管理(104.11.27編修內文).md · relation: AMBIGUOUS
- `圖片001` → `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/020205工地糾紛處理(104.06.15新編內文).md · relation: conceptually_related_to
- `圖片002` → `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/020205工地糾紛處理(104.06.15新編內文).md · relation: conceptually_related_to
- `圖片003` → `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/020205工地糾紛處理(104.06.15新編內文).md · relation: conceptually_related_to
- `圖片004` → `工地糾紛處理`  [AMBIGUOUS]
  data_markdown/020205工地糾紛處理(104.06.15新編內文).md · relation: conceptually_related_to

## Knowledge Gaps
- **267 isolated node(s):** `營造綜合保險`, `聯合承攬授權與印模附件範例`, `標前協議作業流程圖`, `施工規劃`, `鄉里訪談` (+262 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `圖說進度排程`** (2 nodes): `施工圖說清單列表與進度排程`, `七合一進度表`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `會計稽核簽證`** (1 nodes): `會計處、稽核室或簽證會計師`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `建結清圖套繪`** (1 nodes): `建築、結構清圖套繪`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `圖說清圖套繪`** (1 nodes): `圖說清圖套繪`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `湧水處理`** (1 nodes): `湧水`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `特殊地質`** (1 nodes): `特殊地質`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `地下管線`** (1 nodes): `地下管線`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `工規處`** (1 nodes): `工規處`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `各類型教育訓練照片` and `教育訓練`?**
  _Edge tagged AMBIGUOUS (relation: AMBIGUOUS) - confidence is low._
- **What is the exact relationship between `消防急救與現場安全教育照片` and `教育訓練`?**
  _Edge tagged AMBIGUOUS (relation: AMBIGUOUS) - confidence is low._
- **What is the exact relationship between `圖片001` and `工地糾紛處理`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `圖片002` and `工地糾紛處理`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `圖片003` and `工地糾紛處理`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `圖片004` and `工地糾紛處理`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `工務所` connect `薪給與動員管理` to `施工材料管制`, `工地規劃與動線`, `工地零用金`, `下腳料呆料處理`, `保證金與押標金`, `工務所組織管理`, `保固維修管理`, `工地糾紛保險`, `資訊權限與資安`, `預算與成本管控`, `採購發包與廠商`, `動產抵押擔保`, `工程變更協商`, `防災應變編組`, `施工計畫與風險`?**
  _High betweenness centrality (0.533) - this node is a cross-community bridge._