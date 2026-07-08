# Changelog

## [0.1.0](https://github.com/plutocms/supabase-shop/compare/v0.0.1-alpha.21...v0.1.0) (2026-07-08)


### ⚠ BREAKING CHANGES

* renamed `useMedia` to `useProductMedia` and removed `getMediaUrl` util
* removed slug field for now
* accept a slug in product composable
* extract response data in product fetches

### Features

* accept a slug in product composable ([011f595](https://github.com/plutocms/supabase-shop/commit/011f595069350cc258cc4097b69327664dbb00f6))
* add category management API and composable functions ([04b1940](https://github.com/plutocms/supabase-shop/commit/04b1940bd711a58c7dec8becc7accc8a440e4fad))
* add error handling for product not found in API response ([b782b6e](https://github.com/plutocms/supabase-shop/commit/b782b6e057df7a5f7ce0017731dbf46a84fdc70f))
* add sidebar actions for admin navigation ([f7d69ae](https://github.com/plutocms/supabase-shop/commit/f7d69aeb03523a2284a340b3edc38f3a48702cfd))
* added refresh product list button ([2f05669](https://github.com/plutocms/supabase-shop/commit/2f056696674c449d0bdbfc04243e290a41651bab))
* added supabase-storage layer ([335a59c](https://github.com/plutocms/supabase-shop/commit/335a59c83a426521babd68b3fd55493dbd3fdee4))
* created supabase-shop schema ([39c49bb](https://github.com/plutocms/supabase-shop/commit/39c49bb975a961ed92c2c53081588cc09f0426c3))
* enhance product edit routing and add description handling ([7d149b5](https://github.com/plutocms/supabase-shop/commit/7d149b5cc2ec0c73d6884dd1abd705ac14205d25))
* extend supabase layer automatically ([8a50d1d](https://github.com/plutocms/supabase-shop/commit/8a50d1d345e23f30458ff7cb4d22ac6cfea9353d))
* extended utils layer ([b48dabc](https://github.com/plutocms/supabase-shop/commit/b48dabc8f8d1bad22d6ca53aafcbb9f17c831629))
* import NavbarAdminActionButtonProps type in NavbarAdminActions component ([e85accc](https://github.com/plutocms/supabase-shop/commit/e85acccdcbeb1981d57574708ce5f519f30c0d7c))
* moved PostTitleInput component to ui layer ([0107e0b](https://github.com/plutocms/supabase-shop/commit/0107e0b4693a6fb6b37b61d252566ccbd9ba69bd))
* refactor `useProduct` to use Nuxt's `useFetch` ([a39d265](https://github.com/plutocms/supabase-shop/commit/a39d265b922adca88bfb54090aede18b2e73368a))
* refactor Post.vue to improve layout and enhance media handling ([50e3865](https://github.com/plutocms/supabase-shop/commit/50e38658f08fbe245edcde665fc53d209574523e))
* refactor Post.vue to use PostTitleInput component and update layout styles ([c2956e3](https://github.com/plutocms/supabase-shop/commit/c2956e33d42d37e200190bcd05f974b40db2939f))
* refactor product-related types and API endpoints for media and categories ([a00108d](https://github.com/plutocms/supabase-shop/commit/a00108deba1772fbed758972382b2729d9601bba))
* restructure nuxt.config to separate development and production configurations ([508e362](https://github.com/plutocms/supabase-shop/commit/508e36297066cb2bc774909456a8be6fd55d60c8))
* return media url on product API response ([f2b26a4](https://github.com/plutocms/supabase-shop/commit/f2b26a47943ec4e023a297e82a45b6213c6d92fe))
* updated useProduct usage ([b44f057](https://github.com/plutocms/supabase-shop/commit/b44f057d3c5818037c344ab6f705ef550b206c7a))
* **useProductCategory:** created `getCategoryFromSlug` and `getCategoryLabelFromSlug` utilities ([57abf03](https://github.com/plutocms/supabase-shop/commit/57abf03a80ec5810e040f9dc3ae15e8dabd12335))
* **useProduct:** make it optionally awaitable ([7c45862](https://github.com/plutocms/supabase-shop/commit/7c45862205c7c131904657825eb03bb090178f2e))


### Bug Fixes

* add '@vueuse/integrations/useChangeCase' to Vite optimizeDeps ([35f73b3](https://github.com/plutocms/supabase-shop/commit/35f73b3c5294c1edf20bdfe99e5ff0078d1da8aa))
* add '@vueuse/integrations/useChangeCase' to Vite optimizeDeps ([7d9c445](https://github.com/plutocms/supabase-shop/commit/7d9c4453617277522f19103262092bf3ea360ebd))
* add @plutocms/supabase-storage dependency and update nuxt.config.ts reference ([2f08cb2](https://github.com/plutocms/supabase-shop/commit/2f08cb293d7a319564ed6523ebdcca6a45c690c6))
* add @vueuse/nuxt dependency to package.json and bun.lock ([a0b7c47](https://github.com/plutocms/supabase-shop/commit/a0b7c47269ad8c34a08c38aea17cdb990fd4ebd1))
* add fallback to `route.params.slug` in Edit product action button ([ae7a2ee](https://github.com/plutocms/supabase-shop/commit/ae7a2ee113d4c88a63c7e4b22ff304236e086182))
* Add fallback to `route.params.slug` in Edit product action button ([2b0c474](https://github.com/plutocms/supabase-shop/commit/2b0c474ec81b5fb06894acf08366f8d1a914710c))
* added @nuxtjs/supabase and @plutocms/utils ([26f3b19](https://github.com/plutocms/supabase-shop/commit/26f3b19982d295b2a70a2d644f8532a806ffced1))
* added light theme (temporary) ([6087d6f](https://github.com/plutocms/supabase-shop/commit/6087d6f293e66c43e655327fef8e7ca2909297a8))
* adjust padding ([94911ad](https://github.com/plutocms/supabase-shop/commit/94911ad64eb26c245ce2d84310ba5043b6b80379))
* adjustments in layout and styling ([3ebfc49](https://github.com/plutocms/supabase-shop/commit/3ebfc49b5dab8efadeb220331c2848f865be7659))
* auto-install plutocms/ui layer deps ([15dacd7](https://github.com/plutocms/supabase-shop/commit/15dacd7f8a01e955c3b11bbee70d0946d14ccfa9))
* auto-install ui layer dependencies ([bf627ed](https://github.com/plutocms/supabase-shop/commit/bf627ed2cb1691026d6488b79f017955bb1b890b))
* bump version to 0.0.1-alpha.6 and update dependencies ([68e2230](https://github.com/plutocms/supabase-shop/commit/68e2230214b85e8af3e311cdc4c3720c3b0e87a0))
* correct slug URL formatting in Post.vue ([85d6996](https://github.com/plutocms/supabase-shop/commit/85d69961edfbc6d633c5cacc1c89d4026acc8eba))
* enable auto-install for supabase layer ([62bad35](https://github.com/plutocms/supabase-shop/commit/62bad357e444025225b2127d57189dbd6ddb58be))
* extract response data in product fetches ([a135a7b](https://github.com/plutocms/supabase-shop/commit/a135a7bdbbd505616e29d7f71a3974a9168a7590))
* install @nuxtjs/supabase and @plutocms/supabase as regular deps ([04cb4d5](https://github.com/plutocms/supabase-shop/commit/04cb4d55e6801d55863f371ca3d961085a8511c5))
* pre-bundle some deps ([2c813d8](https://github.com/plutocms/supabase-shop/commit/2c813d8bb17f3466d330be6546abf3a8e0b25aa7))
* prevent duplicate media uploads ([f254491](https://github.com/plutocms/supabase-shop/commit/f254491dab9a178490538a7928479767755068a7))
* prevent duplicate media uploads by handling existing and new media separately ([ec6e360](https://github.com/plutocms/supabase-shop/commit/ec6e3601142d1d0e19562b4e1db6a2ba89496221))
* remove @plutocms/supabase-storage from nuxt.config.js extends ([eb5ee53](https://github.com/plutocms/supabase-shop/commit/eb5ee5313b9e2d75d846f7baad13d2ee367aec22))
* remove layer auto-installs ([360ca8f](https://github.com/plutocms/supabase-shop/commit/360ca8fbb097185bc5501bb426e3c5fe2ce79ffc))
* removed environment based extends ([7c46e1e](https://github.com/plutocms/supabase-shop/commit/7c46e1e3a144377e0c0cfe4eea27dff8d592511a))
* removed layer dep auto-install ([d20846b](https://github.com/plutocms/supabase-shop/commit/d20846b5cc646ca846174c485c4243f45560289a))
* removed slug field for now ([2ff20b0](https://github.com/plutocms/supabase-shop/commit/2ff20b05b09fd5c9c32cd46b478de85cb946f9ef))
* rename refresh function variable for consistency in `useProduct` ([cd42616](https://github.com/plutocms/supabase-shop/commit/cd42616139eab6c97a5f4ddc629003b827480d1d))
* renamed `useAvailabilityStatus` composable to `useProductAvailability` and updated usage ([9ce7eb7](https://github.com/plutocms/supabase-shop/commit/9ce7eb7c264a96d61776b62481fc37ad73907416))
* renamed `useCategory` composable to `useProductCategory` ([b954228](https://github.com/plutocms/supabase-shop/commit/b954228e69798673ec295ad66f0c2419e70d93b1))
* reorganize dependencies and trustedDependencies in package.json ([e2eda31](https://github.com/plutocms/supabase-shop/commit/e2eda318e73c22b51c489d9952506762dcd390f9))
* tailwind source detection ([444ad77](https://github.com/plutocms/supabase-shop/commit/444ad77f8d0108b5f287744be7f1e835892e26c5))
* **tailwind:** simplify source detection ([7a56236](https://github.com/plutocms/supabase-shop/commit/7a5623666cb8621e4217a6de1c5a7a08a5ece868))
* typo in API endpoint ([d853709](https://github.com/plutocms/supabase-shop/commit/d8537096c2118f7d49c033adee929294bcee8fd1))
* update @plutocms/supabase configuration to include install option ([adda20a](https://github.com/plutocms/supabase-shop/commit/adda20a431fbd02e977398d1bad1b83ee772f735))
* update @plutocms/supabase dependency to version 0.0.1-alpha.17 ([2f07b37](https://github.com/plutocms/supabase-shop/commit/2f07b3737145df3479a86e3be7383c504ea34cbb))
* update @plutocms/supabase dependency to version 0.0.1-alpha.17 ([6441332](https://github.com/plutocms/supabase-shop/commit/6441332854d1c55ab0f4e7a09daf9f09da23efcc))
* update @plutocms/supabase version to 0.0.1-alpha.11 and remove @plutocms/supabase-storage ([92c5c5c](https://github.com/plutocms/supabase-shop/commit/92c5c5c842c3da8ea6a42bcbf8e37d25f4d49770))
* update @plutocms/supabase version to 0.0.1-alpha.13 and increment package version to 0.0.1-alpha.18 ([2b3b72e](https://github.com/plutocms/supabase-shop/commit/2b3b72e9acb4f52992800257841c853c30de88f8)), closes [#14](https://github.com/plutocms/supabase-shop/issues/14)
* update @plutocms/ui dependency to version 0.0.1-alpha.2 ([0377fe8](https://github.com/plutocms/supabase-shop/commit/0377fe804cef5a0c7457a37eefbf05bad3d026ff))
* update @plutocms/ui dependency to version 0.0.1-alpha.3 ([7b9f9df](https://github.com/plutocms/supabase-shop/commit/7b9f9df13759ae10f690d0dffa2ff9a68c39ff77))
* update dependencies and correct package references ([cdc08a4](https://github.com/plutocms/supabase-shop/commit/cdc08a42196003cca01d039b895470419dd6d9d1))
* update extends syntax in nuxt.config.ts for consistency ([82c3fcb](https://github.com/plutocms/supabase-shop/commit/82c3fcb5591a61f97a909ac047292809de2ec01b))
* update package name to @plutocms/supabase-shop and set main entry point ([e7cdaf9](https://github.com/plutocms/supabase-shop/commit/e7cdaf9a689822d081e2fbeb16d0fe169f647bb2))
* update package reference to use NPM ([318deae](https://github.com/plutocms/supabase-shop/commit/318deaebb5ecb8c6f52c846ab6bac29390ecc5f8))
* update package version to 0.0.1-alpha.10 and dependencies to alpha.6 ([bdc1b4a](https://github.com/plutocms/supabase-shop/commit/bdc1b4afd12e32465c797c39a67a185168b15734))
* update package version to 0.0.1-alpha.11 and dependencies to alpha.7 ([8d7817f](https://github.com/plutocms/supabase-shop/commit/8d7817f7e9ae6f02adaf9285e7faa2fa9a08fa74))
* update package version to 0.0.1-alpha.12 and dependencies to alpha.8 ([f2ff988](https://github.com/plutocms/supabase-shop/commit/f2ff988e56c79cd814d56fa93596fb46444da9c6))
* update package version to 0.0.1-alpha.13 and dependencies to alpha.9 ([2be8cfc](https://github.com/plutocms/supabase-shop/commit/2be8cfc91e845ddaa5adb9f081af21f0817f7076))
* update package version to 0.0.1-alpha.14 ([2995076](https://github.com/plutocms/supabase-shop/commit/2995076188815fda8805ed9335e6da53ce398bd6))
* update package version to 0.0.1-alpha.16 ([67bc506](https://github.com/plutocms/supabase-shop/commit/67bc506b59be2cdf3f891b3ca9187c9abf63ab54))
* update package version to 0.0.1-alpha.17 ([d482f41](https://github.com/plutocms/supabase-shop/commit/d482f419e0f6969c876b3f00870c51435572789a))
* update package version to 0.0.1-alpha.5 and add @plutocms/supabase-storage as a dependency ([16783f1](https://github.com/plutocms/supabase-shop/commit/16783f123a016d4697ab3551e17ab3f2e02cf93c))
* update package version to 0.0.1-alpha.9 and dependencies to alpha.5 ([43f7d37](https://github.com/plutocms/supabase-shop/commit/43f7d37e8057c3316193030ff3258e2857e92d0b))
* update package.json and nuxt.config.ts to include @plutocms/ui as a dependency ([25bdc33](https://github.com/plutocms/supabase-shop/commit/25bdc33f08d9188aa49109085fd767cbb9027cc8))
* update references from product_categories to product_category ([c211874](https://github.com/plutocms/supabase-shop/commit/c2118744fd5264ce03b6cc1dc91adac8fe77543a))
* update version to 0.0.1-alpha.2 in package.json ([68cf3d5](https://github.com/plutocms/supabase-shop/commit/68cf3d561986070c12fb4963643981750699c2e3))
* updated product New Product endpoint ([485a77b](https://github.com/plutocms/supabase-shop/commit/485a77bdb071bba1e52e6aadf59dac1ee0ad8915))
* updated product path to remove id ([dcfad1e](https://github.com/plutocms/supabase-shop/commit/dcfad1ea63d9c60de727d1419961975a6d8a6f19))
* updated ProductItem types ([26a7ca3](https://github.com/plutocms/supabase-shop/commit/26a7ca3a585ddd73c5abd1954a567f11af4e58f5))
* use utils layer from github ([3b84b7f](https://github.com/plutocms/supabase-shop/commit/3b84b7f713cee92f7dc5e5d7c6f0e1316eef15d7))


### Miscellaneous Chores

* **ci:** add CI and release-please automated release pipeline ([c3e51a0](https://github.com/plutocms/supabase-shop/commit/c3e51a091a72d4806111206d8ae479f14b0fdf29))


### Code Refactoring

* renamed `useMedia` to `useProductMedia` and removed `getMediaUrl` util ([3d8d74c](https://github.com/plutocms/supabase-shop/commit/3d8d74c2c883f4bd18bb0ff0b15b7ee79d80c803))
