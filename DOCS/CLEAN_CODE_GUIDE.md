# Clean Code Guide

디딤로그(DidimLog)는 우아한 테크코스 클린 코드 원칙을 지향합니다.

## 1. Code Constraints

1. Indent(들여쓰기) Depth는 1까지만 허용한다.
2. `else` 예약어를 사용하지 않는다.
3. 모든 원시값(Primitive)과 문자열을 포장(Wrapping)한다.
4. 일급 컬렉션(First Class Collection)을 사용한다.
5. 3개 이상의 인스턴스 변수를 가진 클래스를 쓰지 않는다.
6. Getter/Setter 사용을 지양한다. (DTO는 예외)
7. 한 메서드는 오직 한 가지 일만 해야 한다.

## 2. Style Guide

- Kotlin/Java: [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
