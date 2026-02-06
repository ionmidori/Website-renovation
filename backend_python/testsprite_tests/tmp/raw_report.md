
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** backend_python
- **Date:** 2026-02-04
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 submit_lead_saves_contact_and_project_info
- **Test Code:** [TC001_submit_lead_saves_contact_and_project_info.py](./TC001_submit_lead_saves_contact_and_project_info.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 86, in <module>
  File "<string>", line 41, in test_submit_lead_saves_contact_and_project_info
AssertionError: Expected status 201 Created but got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/152f6bec-9786-41cf-874c-e5a4fe5f9259
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 get_market_prices_returns_current_data
- **Test Code:** [TC002_get_market_prices_returns_current_data.py](./TC002_get_market_prices_returns_current_data.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 49, in <module>
  File "<string>", line 16, in test_get_market_prices_returns_current_data
AssertionError: Expected status code 200, got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/ad1d184f-700f-4af9-add6-29a86f3473ba
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 generate_render_produces_photorealistic_images
- **Test Code:** [TC003_generate_render_produces_photorealistic_images.py](./TC003_generate_render_produces_photorealistic_images.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 78, in <module>
  File "<string>", line 37, in test_generate_render_produces_photorealistic_images
AssertionError: Expected status 200 or 201, got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/85775db4-e63c-4954-8742-405bce1c97dc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 save_quote_stores_structured_renovation_draft
- **Test Code:** [TC004_save_quote_stores_structured_renovation_draft.py](./TC004_save_quote_stores_structured_renovation_draft.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 96, in <module>
  File "<string>", line 53, in test_save_quote_stores_structured_renovation_draft
AssertionError: Expected 201 Created, got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/3d743784-67ea-4a86-a7cd-72a1c74e81d7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 analyze_room_outputs_structural_style_condition_insights
- **Test Code:** [TC005_analyze_room_outputs_structural_style_condition_insights.py](./TC005_analyze_room_outputs_structural_style_condition_insights.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 28, in analyze_media
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 404 Client Error: Not Found for url: http://localhost:8080/analyze_room

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 59, in <module>
  File "<string>", line 55, in test_analyze_room_outputs_structural_style_condition_insights
  File "<string>", line 47, in analyze_media
AssertionError: HTTP error occurred: 404 Client Error: Not Found for url: http://localhost:8080/analyze_room

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/5d32af94-b571-4f34-858b-50e37daf210c
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 plan_renovation_generates_skeleton_skin_architectural_plan
- **Test Code:** [TC006_plan_renovation_generates_skeleton_skin_architectural_plan.py](./TC006_plan_renovation_generates_skeleton_skin_architectural_plan.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 52, in <module>
  File "<string>", line 27, in test_plan_renovation_generates_skeleton_skin_architectural_plan
AssertionError: Unexpected status code: 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/7434c7f1-a69a-4e9d-8039-83e53d04e989
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 list_project_files_returns_complete_asset_listing
- **Test Code:** [TC007_list_project_files_returns_complete_asset_listing.py](./TC007_list_project_files_returns_complete_asset_listing.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 83, in <module>
  File "<string>", line 48, in test_list_project_files_returns_complete_asset_listing
  File "<string>", line 19, in create_test_project
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 404 Client Error: Not Found for url: http://localhost:8080/projects

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/c7570bae-fc13-4faf-95ab-e26a8c79e8f4
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 show_project_gallery_displays_recent_renders_and_photos
- **Test Code:** [TC008_show_project_gallery_displays_recent_renders_and_photos.py](./TC008_show_project_gallery_displays_recent_renders_and_photos.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 88, in <module>
  File "<string>", line 63, in test_show_project_gallery_displays_recent_renders_and_photos
  File "<string>", line 19, in create_project
  File "/var/task/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 404 Client Error: Not Found for url: http://localhost:8080/projects

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/3a4aa4b4-8712-40a2-95ca-c0574be455e9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 generate_cad_creates_downloadable_dxf_file
- **Test Code:** [TC009_generate_cad_creates_downloadable_dxf_file.py](./TC009_generate_cad_creates_downloadable_dxf_file.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 69, in <module>
  File "<string>", line 22, in test_generate_cad_creates_downloadable_dxf_file
FileNotFoundError: [Errno 2] No such file or directory: 'test_resources/sample_room_image.jpg'

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/ee30b400-60d2-4dd6-8559-12d32244af4e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 role_based_access_enforces_permissions_and_validation
- **Test Code:** [TC010_role_based_access_enforces_permissions_and_validation.py](./TC010_role_based_access_enforces_permissions_and_validation.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 125, in <module>
  File "<string>", line 89, in test_role_based_access_enforces_permissions_and_validation
AssertionError: Expected 403 for unauthorized role on http://localhost:8080/leads, got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/4b133879-89eb-4e01-bd13-780b82deeea7/5ca80c18-ac3f-4ddf-b708-1a0c5e34038b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **0.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---