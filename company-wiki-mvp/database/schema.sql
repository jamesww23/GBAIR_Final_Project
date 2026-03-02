-- Company Wiki MVP - Database Schema
-- Requires PostgreSQL 15+ with pgvector extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- Documents table: unified store for projects, policies, comms
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_type      text        NOT NULL CHECK (doc_type IN ('PROJECT', 'POLICY', 'COMM')),
  title         text        NOT NULL,
  content       text        NOT NULL,
  category      text        CHECK (category IN ('HR', 'FINANCE', 'GENERAL', 'EXEC')),
  department    text        CHECK (department IN ('HR', 'FINANCE', 'ENG', 'OPS', 'EXEC')),
  effective_date date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  access_level  text        NOT NULL CHECK (access_level IN ('GENERAL', 'HR', 'FINANCE', 'EXEC')),
  source_ref    text        NOT NULL,
  -- PROJECT-only metadata (nullable for non-project docs)
  owner         text,
  status        text,
  tags          text[]
);

-- ============================================================
-- Document chunks with vector embeddings
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  chunk_id    uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  doc_id      uuid    NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index int     NOT NULL,
  content     text    NOT NULL,
  embedding   vector(1536)
);

-- ============================================================
-- Audit logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp   timestamptz DEFAULT now(),
  role        text,
  endpoint    text,
  query_text  text
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_documents_access_doctype ON documents(access_level, doc_type);
CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON document_chunks(doc_id);

-- IVFFlat index for vector similarity search (cosine distance)
-- Note: For best performance, rebuild this index after bulk data loads (see seed.js)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding
  ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
