CREATE TABLE code_chunks (
    id BIGSERIAL PRIMARY KEY,

    repository_id BIGINT NOT NULL,

    file_path TEXT NOT NULL,

    chunk_index INTEGER NOT NULL,

    start_line INTEGER NOT NULL,

    end_line INTEGER NOT NULL,

    content TEXT NOT NULL,

    embedding VECTOR(768),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_code_chunks_repository
        FOREIGN KEY (repository_id)
        REFERENCES repositories(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_repository_file_chunk
        UNIQUE (repository_id, file_path, chunk_index)
);