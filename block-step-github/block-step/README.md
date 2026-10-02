# 블록 스텝 — GitHub 이전용

이 폴더에는 게임 소스와 GitHub Pages에서 바로 제공할 수 있는 `docs/` 배포 파일이 함께 들어 있습니다. 기존 Sites 서버에 의존하지 않는 React + TypeScript + Vite 정적 웹앱입니다.

## 개발을 몰라도 올리는 방법

1. ZIP을 컴퓨터에서 압축 해제합니다.
2. GitHub에서 사용할 저장소를 만듭니다. 기존 파일이 있는 저장소라면 덮어쓰기 전에 확인하세요.
3. 저장소의 파일 업로드 화면에서 `block-step` 폴더 **안의 내용**을 올립니다. `docs` 폴더가 저장소 최상위에 보여야 합니다. ZIP 파일 자체만 올리면 배포되지 않습니다.
4. 소스 보관만 원하면 여기까지 진행합니다.
5. 웹사이트도 GitHub Pages로 옮기려면 저장소의 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**를 선택합니다.
6. 파일을 올린 브랜치(보통 `main`)와 `/docs` 폴더를 선택하고 **Save**를 누릅니다.
7. 배포가 끝나면 같은 화면에 표시되는 사이트 주소를 엽니다.

GitHub에 로그인한 사용자가 선택한 저장소의 파일과 Pages 설정을 변경할 권한이 있어야 합니다. 저장소의 공개 범위와 웹사이트의 공개 범위를 확인한 뒤 Pages를 활성화하세요. 계정/조직 정책에 따라 Pages 제공 여부가 다를 수 있습니다.

공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 포함된 기능

- 8×8 보드, 가로·세로 동시 줄 제거, 점수와 콤보
- 최고 기록 모드와 20개 미션 스테이지
- 보석 수집, 별 평가, 단계 해금, 이어하기
- 마우스·터치 및 선택 후 배치
- 효과음/효과 줄이기, 로컬 저장, 설치 가능한 PWA와 오프라인 캐시

브라우저에 저장된 기록은 주소별로 분리되므로 기존 사이트의 기록이 새 GitHub 주소로 자동 이전되지는 않습니다. 기존 게임 사이트는 이 ZIP 작성 과정에서 변경하지 않았습니다.

## 개발 및 수정

Node.js 22.13 이상과 pnpm을 사용하는 구성입니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

`pnpm build`가 최신 소스로 `docs/` 배포 폴더를 다시 만듭니다. 소스를 수정한 뒤에는 새 `docs/`도 함께 커밋해야 사이트에 반영됩니다. 처음 업로드할 때는 이미 빌드한 `docs/`가 있으므로 설치나 빌드를 하지 않아도 됩니다.

기존 의존성 및 잠금 파일은 재현성을 위해 유지했으며, 앱 실행에 Sites 인증, Cloudflare Worker 또는 데이터베이스는 필요하지 않습니다.

## 검증

- TypeScript 검사 통과
- Vite 프로덕션 빌드 통과
- 11개 자동 검사 그룹 통과
- 20개 스테이지 해답을 재생해 별 3개 가능성 확인
- GitHub 프로젝트 경로에서도 작동하도록 리소스·서비스 워커·설치 경로를 상대 경로로 변경

GitHub 계정에 실제 업로드/배포한 상태는 아닙니다. 실기기의 터치·설치·오프라인 실행과 GitHub 배포 환경 확인은 남아 있습니다.
