# 알렉산더 포토

구글 포토 클론 프로젝트입니다.

![screenshot](https://user-images.githubusercontent.com/49304239/132171918-336260bd-158e-47c5-b4d2-c0f2e6b43ad8.gif)

알렉산더는 저희 집 고양이 이름이에요. 코리안 숏헤어이고, 2018년 11월에 태어나(추정), 2019년 11월에 가족이 되었답니다.

데모 링크에서 이미지 업로드와 삭제를 자유롭게 해볼 수 있습니다. (업로드 가능한 이미지: 6MB 이하의 `jpg` 또는 `png` 파일)

데모 링크: [https://woochul2.github.io/alexander-photos/](https://woochul2.github.io/alexander-photos/)

## 프론트엔드 기술 스택

- JavaScript

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
            "_id": "6134e7111a7664ba09ddae8d",
            "filePath": "20210510_180622.jpg",
            "dateTime": "2021:05:10 18:06:22",
            "make": "samsung",
            "model": "SM-N950N",
            "orientation": 6,
            "pixelXDimension": 4032,
            "pixelYDimension": 1960
        },
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

200: OK

```json
{
    "message": "Uploaded xps-2L-0vnCnzcU-unsplash.jpg successfully",
    "result": {
        "_id": "6135aa295c638c0edaf31555",
        "filePath": "xps-2L-0vnCnzcU-unsplash.jpg",
        "dateTime": "2021:09:06 05:42:01",
        "orientation": 1,
        "pixelXDimension": 6016,
        "pixelYDimension": 4016
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

쿼리 파라미터가 존재하지 않을 때의 기본값은 높이가 250px, 너비가 자동인 이미지입니다.

w, h를 쿼리 파라미터로 넘긴다면, 그에 맞는 너비와 높이를 가진 이미지를 가져올 수 있습니다.

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

## 참고 자료

- [프로그래머스 고양이 사진첩 애플리케이션 과제 해설](https://prgms.tistory.com/53)
- [Building a RESTful API with Node.js](https://www.youtube.com/playlist?list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q)
