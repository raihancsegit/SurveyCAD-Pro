# 05. Database Schema & REST APIs
**Land Survey CAD & Plot Management Platform**

---

## 1. Cloud PostgreSQL + PostGIS Schema (20 Tables)

```sql
-- 1. Users & Surveyors Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    surveyor_reg_no VARCHAR(60),
    role VARCHAR(30) DEFAULT 'surveyor', -- 'admin', 'surveyor', 'client'
    company_name VARCHAR(150),
    signature_url VARCHAR(255),
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Survey Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    district VARCHAR(80),
    upazila VARCHAR(80),
    mouza VARCHAR(100),
    jl_number VARCHAR(50),
    default_unit VARCHAR(30) DEFAULT 'link', -- 'link', 'feet', 'meter'
    default_scale VARCHAR(30) DEFAULT '16_inch',
    is_archived BOOLEAN DEFAULT false,
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Raster Mouza Maps Table
CREATE TABLE maps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(60),
    image_width INT NOT NULL,
    image_height INT NOT NULL,
    era_type VARCHAR(30) DEFAULT 'RS', -- 'CS', 'SA', 'RS', 'BS', 'CITY'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Map Scale Calibrations Table
CREATE TABLE map_calibrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
    point1_x DOUBLE PRECISION NOT NULL,
    point1_y DOUBLE PRECISION NOT NULL,
    point2_x DOUBLE PRECISION NOT NULL,
    point2_y DOUBLE PRECISION NOT NULL,
    ground_distance DOUBLE PRECISION NOT NULL,
    distance_unit VARCHAR(20) NOT NULL, -- 'link', 'feet', 'meter'
    scale_factor DOUBLE PRECISION NOT NULL, -- ground units per pixel
    preset_name VARCHAR(30), -- '16_inch', '32_inch', etc.
    rmse_error DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CAD Layers Table
CREATE TABLE layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    color_hex VARCHAR(10) DEFAULT '#000000',
    line_width DOUBLE PRECISION DEFAULT 1.0,
    line_style VARCHAR(20) DEFAULT 'solid', -- 'solid', 'dashed', 'dotted'
    is_visible BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0
);

-- 6. Survey Plots (Parcels) Table with PostGIS Polygon Geometry
CREATE TABLE plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    layer_id UUID REFERENCES layers(id) ON DELETE SET NULL,
    plot_number VARCHAR(50) NOT NULL, -- e.g. 'দাগ নং ৫১২'
    khatian_no VARCHAR(50),
    owner_name VARCHAR(150),
    calculated_sqft DOUBLE PRECISION NOT NULL,
    calculated_shotok DOUBLE PRECISION NOT NULL,
    calculated_katha DOUBLE PRECISION NOT NULL,
    calculated_bigha DOUBLE PRECISION NOT NULL,
    calculated_perimeter_feet DOUBLE PRECISION NOT NULL,
    centroid_x DOUBLE PRECISION NOT NULL,
    centroid_y DOUBLE PRECISION NOT NULL,
    fill_color VARCHAR(10),
    hatch_style VARCHAR(30) DEFAULT 'none',
    geom GEOMETRY(Polygon, 0), -- 2D Local CAD coordinates
    wgs84_geom GEOMETRY(Polygon, 4326), -- Geographic GPS coordinates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Plot Vertices Table
CREATE TABLE plot_vertices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
    vertex_index INT NOT NULL,
    coord_x DOUBLE PRECISION NOT NULL,
    coord_y DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- 8. CAD Lines and Objects Table
CREATE TABLE cad_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    layer_id UUID REFERENCES layers(id) ON DELETE SET NULL,
    object_type VARCHAR(30) NOT NULL, -- 'point', 'line', 'polyline', 'circle', 'arc', 'text'
    properties JSONB NOT NULL,
    coordinates JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Dimensions & Measurements Table
CREATE TABLE dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    start_x DOUBLE PRECISION NOT NULL,
    start_y DOUBLE PRECISION NOT NULL,
    end_x DOUBLE PRECISION NOT NULL,
    end_y DOUBLE PRECISION NOT NULL,
    measured_value DOUBLE PRECISION NOT NULL,
    display_text VARCHAR(80) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. GPS Field Survey Track Table
CREATE TABLE gps_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    plot_id UUID REFERENCES plots(id) ON DELETE SET NULL,
    recorded_by UUID REFERENCES users(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy_meters DOUBLE PRECISION,
    altitude_meters DOUBLE PRECISION,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Bi-Directional Offline Sync Changelog Table
CREATE TABLE sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_device_id VARCHAR(100) NOT NULL,
    entity_table VARCHAR(60) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    payload JSONB NOT NULL,
    client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 2. Core REST API Endpoints

### Authentication & Profiles
- `POST /api/auth/register` — Register land surveyor profile
- `POST /api/auth/login` — JWT authentication login
- `GET /api/auth/me` — Get surveyor profile, signature, and license status

### Projects
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create a new survey project
- `GET /api/projects/:id` — Fetch full project tree (maps, plots, layers)
- `PUT /api/projects/:id` — Update project metadata
- `DELETE /api/projects/:id` — Archive or soft-delete project

### Maps & Calibration
- `POST /api/projects/:id/maps/upload` — Upload high-resolution scanned map
- `POST /api/maps/:id/calibrate` — Save two-point scale calibration parameters

### Plots & Partitioning
- `GET /api/projects/:id/plots` — Fetch all parcel polygons
- `POST /api/projects/:id/plots` — Save newly drawn plot
- `POST /api/plots/:id/split` — Compute plot division (Equal, Area, or Ratio partition)
- `POST /api/plots/:id/merge` — Merge multiple contiguous plots

### Field GPS & KML
- `POST /api/projects/:id/gps/track` — Upload real-time GPS boundary walk points
- `GET /api/projects/:id/export/kml` — Download Google Earth KML polygon package

### PDF & DXF Exports
- `POST /api/projects/:id/reports/survey-pdf` — Generate certified survey report PDF
- `GET /api/projects/:id/export/dxf` — Download AutoCAD R12/2000 DXF file

### Bi-directional Sync
- `POST /api/sync/push` — Upload batch of offline changes from SQLite queue
- `POST /api/sync/pull` — Download server-side changes made since timestamp $T$

---
