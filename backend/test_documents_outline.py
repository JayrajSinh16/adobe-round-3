import os
import json
import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), 'sample_pdf')


def test_bulk_upload_and_outline_generation():
    start_time = time.time()
    
    pdf_files = []
    for name in os.listdir(SAMPLE_DIR):
        if name.lower().endswith('.pdf'):
            pdf_files.append(("files", (name, open(os.path.join(SAMPLE_DIR, name), 'rb'), 'application/pdf')))

    assert pdf_files, "No sample PDFs found in sample_pdf folder"
    print(f"Found {len(pdf_files)} PDF files to upload")

    upload_start = time.time()
    response = client.post('/api/documents/bulk-upload', files=pdf_files)
    upload_time = time.time() - upload_start
    
    assert response.status_code == 200, response.text
    docs = response.json()
    assert len(docs) == len(pdf_files)
    
    print(f"Bulk upload completed in {upload_time:.2f} seconds")
    print(f"Average time per document: {upload_time/len(docs):.2f} seconds")

    # Check outline JSON existence & basic structure
    outline_validation_start = time.time()
    for i, doc in enumerate(docs):
        outline_path = doc.get('outline_path')
        assert outline_path and os.path.exists(outline_path), f"Outline file missing for {doc['id']}"
        with open(outline_path, 'r') as f:
            outline_json = json.load(f)
        assert 'title' in outline_json and 'outline' in outline_json
        assert isinstance(outline_json['outline'], list)
        print(f"Document {i+1}: {doc['filename']} - {len(outline_json['outline'])} headings extracted")
    
    outline_validation_time = time.time() - outline_validation_start
    print(f"Outline validation completed in {outline_validation_time:.2f} seconds")

    # Test search endpoint using a heading term (fallback to generic term if none)
    # Collect one heading text if available
    search_start = time.time()
    sample_heading = None
    for doc in docs:
        with open(doc['outline_path'], 'r') as f:
            outline_json = json.load(f)
        if outline_json['outline']:
            sample_heading = outline_json['outline'][0]['text'].split()[0]
            break

    query_term = sample_heading or 'Introduction'
    search_resp = client.get('/api/search/headings', params={'query': query_term})
    search_time = time.time() - search_start
    
    assert search_resp.status_code == 200
    results = search_resp.json()
    print(f"Search for '{query_term}' returned {len(results)} results in {search_time:.2f} seconds")
    
    # Not asserting non-empty because depends on PDFs, but ensure structure
    if results:
        first = results[0]
        for key in ['heading', 'page', 'pdf_name', 'pdf_id']:
            assert key in first
    
    total_time = time.time() - start_time
    print(f"\nTotal execution time: {total_time:.2f} seconds")
    print(f"Breakdown:")
    print(f"  - Upload & outline generation: {upload_time:.2f}s ({upload_time/total_time*100:.1f}%)")
    print(f"  - Outline validation: {outline_validation_time:.2f}s ({outline_validation_time/total_time*100:.1f}%)")
    print(f"  - Search test: {search_time:.2f}s ({search_time/total_time*100:.1f}%)")


def run():
    print("Starting document upload and outline generation test...")
    test_bulk_upload_and_outline_generation()
    print('\nAll document upload & outline tests passed successfully!')

if __name__ == '__main__':
    run()
