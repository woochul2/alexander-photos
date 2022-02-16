# 알렉산더 포토

구글 포토 클론 프로젝트입니다.

![screenshot](https://user-images.githubusercontent.com/49304239/149685950-d93b57e6-9270-4b6f-9287-ff69f9ad0a2b.gif)

알렉산더는 저희 집 고양이 이름이에요. 코리안 숏헤어이고, 2018년 11월에 태어나(추정), 2019년 11월에 가족이 되었답니다.

데모 링크에서 이미지 업로드와 삭제를 자유롭게 해볼 수 있습니다. (업로드 가능한 이미지: 6MB 이하의 `jpg` 또는 `png` 파일)

[데모 링크](https://alexander-photos.vercel.app/) (데모 링크는 모바일에서도 접속할 수 있습니다.)

프론트엔드는 바닐라 자바스크립트로 구현했습니다.

## 백엔드 기술 스택

- Node.js
- Express
- MongoDB
- Serverless Framework
- AWS
  - S3
  - Lambda
  - API Gateway

## API

API 엔드포인트: [https://4gpk31lzj8.execute-api.ap-northeast-2.amazonaws.com/dev](https://4gpk31lzj8.execute-api.ap-northeast-2.amazonaws.com/dev)

### GET /api/images

모든 이미지 정보를 가져옵니다.

**Response Example**

200: OK

```json
{
  "results": [
    {
      "_id": "61add69e3ab555d262f719df",
      "filePath": "1638610207000_IMG_0279.jpg",
      "dateTime": 1638610207000,
      "make": "Apple",
      "model": "iPhone 12",
      "orientation": 6,
      "pixelXDimension": 4032,
      "pixelYDimension": 3024
    }
  ]
}
```

---

### POST /api/image

이미지를 업로드합니다.

**Form Data Parameters**

<table>
  <tbody>
    <tr>
      <td>photo</td>
      <td>file</td>
      <td>6MB 이하의 jpg 또는 png 파일</td>
    </tr>
    <tr>
      <td>exifData (optional)</td>
      <td>string</td>
      <td>EXIF (JSON을 string으로 변환한 값이어야 합니다.)</td>
    </tr>
  </tbody>
</table>

**Response Example**

201: Created

```json
{
  "message": "Uploaded IMG_0392.jpg successfully",
  "result": {
    "_id": "61e39a91dea31de8ba75c488",
    "filePath": "1642142778000_IMG_0392.jpg",
    "dateTime": 1642142778000,
    "make": "Apple",
    "model": "iPhone 12",
    "orientation": 6,
    "pixelXDimension": 4032,
    "pixelYDimension": 3024
  }
}
```

---

### DELETE /api/image/:filePath

이미지를 삭제합니다.

**Path Parameters**

<table>
  <tbody>
    <tr>
      <td>filePath</td>
      <td>string</td>
      <td>파일 경로</td>
    </tr>
  </tbody>
</table>

**Response Example**

200: OK

```json
{
  "message": "Deleted xps-2L-0vnCnzcU-unsplash.jpg successfully"
}
```

---

### GET /image/:filePath

최적화된 이미지를 가져옵니다.

w, h를 쿼리 파라미터로 넘기면, 그에 맞는 너비와 높이를 가진 이미지를 가져올 수 있습니다.

w 또는 h가 원본 이미지의 너비 또는 높이보다 크다면, 결과 이미지의 크기는 자동으로 원본 이미지의 너비 또는 높이가 됩니다.

**Path Parameters**

<table>
  <tbody>
    <tr>
      <td>filePath</td>
      <td>string</td>
      <td>파일 경로</td>
    </tr>
  </tbody>
</table>

**Query Parameters**

<table>
  <tbody>
    <tr>
      <td>w (optional)</td>
      <td>number</td>
      <td>너비</td>
    </tr>
    <tr>
      <td>h (optional)</td>
      <td>number</td>
      <td>높이</td>
    </tr>
  </tbody>
</table>

---

### GET /image/original/:filePath

이미지 원본을 가져옵니다.

**Path Parameters**

<table>
  <tbody>
    <tr>
      <td>filePath</td>
      <td>string</td>
      <td>파일 경로</td>
    </tr>
  </tbody>
</table>
