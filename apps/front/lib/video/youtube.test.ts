import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { youtubeEmbedUrl, youtubeId } from "./youtube";

describe("youtubeId", () => {
  it("lê os formatos de link do YouTube", () => {
    assert.equal(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(youtubeId("https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s"), "dQw4w9WgXcQ");
    assert.equal(youtubeId("https://m.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(youtubeId("https://youtu.be/dQw4w9WgXcQ?si=abc"), "dQw4w9WgXcQ");
    assert.equal(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assert.equal(youtubeId("  https://youtu.be/dQw4w9WgXcQ  "), "dQw4w9WgXcQ");
  });

  it("recusa o que não é vídeo do YouTube", () => {
    assert.equal(youtubeId(""), null);
    assert.equal(youtubeId(null), null);
    assert.equal(youtubeId("dQw4w9WgXcQ"), null);
    assert.equal(youtubeId("https://vimeo.com/123456"), null);
    assert.equal(youtubeId("https://www.youtube.com/@canal"), null);
    assert.equal(youtubeId("https://www.youtube.com/watch?v=curto"), null);
    assert.equal(youtubeId("https://evil.com/watch?v=dQw4w9WgXcQ"), null);
  });
});

describe("youtubeEmbedUrl", () => {
  it("usa o domínio sem cookie", () => {
    assert.equal(youtubeEmbedUrl("dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
});
