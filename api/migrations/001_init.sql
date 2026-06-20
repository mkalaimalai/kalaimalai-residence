-- Auto-generated from SQLAlchemy metadata. Apply once to the Supabase database.

CREATE TABLE IF NOT EXISTS boq_line_items (
	id VARCHAR NOT NULL, 
	boq_id VARCHAR NOT NULL, 
	project_id VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	work_package_id VARCHAR NOT NULL, 
	description TEXT NOT NULL, 
	quantity NUMERIC NOT NULL, 
	unit VARCHAR NOT NULL, 
	benchmark_rate NUMERIC NOT NULL, 
	approved_rate NUMERIC NOT NULL, 
	approved_vendor_id VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS boqs (
	id VARCHAR NOT NULL, 
	vendor_id VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	quote_date VARCHAR NOT NULL, 
	original_amount NUMERIC NOT NULL, 
	negotiated_amount NUMERIC NOT NULL, 
	gst NUMERIC NOT NULL, 
	total NUMERIC NOT NULL, 
	payment_status VARCHAR NOT NULL, 
	file_url VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS decisions (
	id VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	domain_id VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	type VARCHAR NOT NULL, 
	options_considered VARCHAR[] NOT NULL, 
	final_decision TEXT NOT NULL, 
	reason TEXT NOT NULL, 
	cost_impact VARCHAR NOT NULL, 
	time_impact VARCHAR NOT NULL, 
	quality_impact VARCHAR NOT NULL, 
	date VARCHAR NOT NULL, 
	owner VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS deliveries (
	id VARCHAR NOT NULL, 
	purchase_order_id VARCHAR NOT NULL, 
	project_id VARCHAR NOT NULL, 
	expected_date VARCHAR NOT NULL, 
	actual_date VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS domains (
	id VARCHAR NOT NULL, 
	slug VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	description TEXT NOT NULL, 
	space_ids VARCHAR[] NOT NULL, 
	drawing_ids VARCHAR[] NOT NULL, 
	vendor_ids VARCHAR[] NOT NULL, 
	status VARCHAR NOT NULL, 
	lesson_ids VARCHAR[] NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS drawings (
	id VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	domain_id VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	revision VARCHAR NOT NULL, 
	date VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	consultant VARCHAR NOT NULL, 
	file_url VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS gallery_items (
	id VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	image VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	domain_id VARCHAR NOT NULL, 
	caption TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS inspections (
	id VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	work_package_id VARCHAR NOT NULL, 
	inspector VARCHAR NOT NULL, 
	inspection_date VARCHAR NOT NULL, 
	result VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS lessons (
	id VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	summary TEXT NOT NULL, 
	domain_id VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	impact JSONB NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS materials (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	space_ids VARCHAR[] NOT NULL, 
	vendor_id VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	image VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS notifications (
	id VARCHAR NOT NULL, 
	channel VARCHAR NOT NULL, 
	recipient VARCHAR NOT NULL, 
	subject VARCHAR NOT NULL, 
	body TEXT NOT NULL, 
	status VARCHAR NOT NULL, 
	related_entity VARCHAR NOT NULL, 
	created_at VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS procurement_items (
	id VARCHAR NOT NULL, 
	item VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	brand VARCHAR NOT NULL, 
	vendor_id VARCHAR NOT NULL, 
	country VARCHAR NOT NULL, 
	quantity INTEGER NOT NULL, 
	estimated_price NUMERIC NOT NULL, 
	quoted_price NUMERIC NOT NULL, 
	negotiated_price NUMERIC NOT NULL, 
	final_price NUMERIC NOT NULL, 
	currency VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	delivery_date VARCHAR NOT NULL, 
	installation_date VARCHAR NOT NULL, 
	warranty VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS progress_entries (
	id VARCHAR NOT NULL, 
	date VARCHAR NOT NULL, 
	phase VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	work_completed TEXT NOT NULL, 
	photos VARCHAR[] NOT NULL, 
	issues TEXT NOT NULL, 
	next_action TEXT NOT NULL, 
	owner VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS projects (
	id VARCHAR NOT NULL, 
	public_title VARCHAR NOT NULL, 
	public_subtitle VARCHAR NOT NULL, 
	city VARCHAR NOT NULL, 
	designer VARCHAR NOT NULL, 
	direction TEXT NOT NULL, 
	hero_image VARCHAR NOT NULL, 
	concept_statement TEXT NOT NULL, 
	internal_name VARCHAR NOT NULL, 
	villa_no VARCHAR NOT NULL, 
	community VARCHAR NOT NULL, 
	address VARCHAR NOT NULL, 
	plot_area VARCHAR NOT NULL, 
	built_up_area VARCHAR NOT NULL, 
	floors INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	start_date VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
	id VARCHAR NOT NULL, 
	project_id VARCHAR NOT NULL, 
	quote_id VARCHAR NOT NULL, 
	vendor_id VARCHAR NOT NULL, 
	amount NUMERIC NOT NULL, 
	currency VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	created_at VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS quote_line_items (
	id VARCHAR NOT NULL, 
	quote_id VARCHAR NOT NULL, 
	boq_line_id VARCHAR NOT NULL, 
	description TEXT NOT NULL, 
	quantity NUMERIC NOT NULL, 
	unit VARCHAR NOT NULL, 
	unit_price NUMERIC NOT NULL, 
	total_price NUMERIC NOT NULL, 
	brand VARCHAR NOT NULL, 
	specification TEXT NOT NULL, 
	inclusions TEXT NOT NULL, 
	exclusions TEXT NOT NULL, 
	negotiation_target_price NUMERIC NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS quotes (
	id VARCHAR NOT NULL, 
	project_id VARCHAR NOT NULL, 
	vendor_id VARCHAR NOT NULL, 
	boq_id VARCHAR NOT NULL, 
	quote_number VARCHAR NOT NULL, 
	quote_date VARCHAR NOT NULL, 
	valid_until VARCHAR NOT NULL, 
	total_amount NUMERIC NOT NULL, 
	currency VARCHAR NOT NULL, 
	tax_amount NUMERIC NOT NULL, 
	scope_summary TEXT NOT NULL, 
	terms TEXT NOT NULL, 
	document_id VARCHAR NOT NULL, 
	comparison_status VARCHAR NOT NULL, 
	approved_amount NUMERIC NOT NULL, 
	approved_by VARCHAR NOT NULL, 
	approval_note TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS snags (
	id VARCHAR NOT NULL, 
	space_id VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	description TEXT NOT NULL, 
	photo_url VARCHAR NOT NULL, 
	assigned_to VARCHAR NOT NULL, 
	priority VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	target_closure_date VARCHAR NOT NULL, 
	actual_closure_date VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS spaces (
	id VARCHAR NOT NULL, 
	slug VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	description TEXT NOT NULL, 
	design_intent TEXT NOT NULL, 
	image VARCHAR NOT NULL, 
	domain_ids VARCHAR[] NOT NULL, 
	material_ids VARCHAR[] NOT NULL, 
	furniture VARCHAR[] NOT NULL, 
	lighting VARCHAR[] NOT NULL, 
	vendor_ids VARCHAR[] NOT NULL, 
	drawing_ids VARCHAR[] NOT NULL, 
	decision_ids VARCHAR[] NOT NULL, 
	status VARCHAR NOT NULL, 
	lesson_ids VARCHAR[] NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS vendors (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	contact_person VARCHAR NOT NULL, 
	phone VARCHAR NOT NULL, 
	email VARCHAR NOT NULL, 
	location VARCHAR NOT NULL, 
	website VARCHAR NOT NULL, 
	quote_url VARCHAR NOT NULL, 
	finalized BOOLEAN NOT NULL, 
	rating NUMERIC NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS warranties (
	id VARCHAR NOT NULL, 
	item VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	vendor_id VARCHAR NOT NULL, 
	brand VARCHAR NOT NULL, 
	purchase_date VARCHAR NOT NULL, 
	warranty_start VARCHAR NOT NULL, 
	warranty_end VARCHAR NOT NULL, 
	invoice_url VARCHAR NOT NULL, 
	manual_url VARCHAR NOT NULL, 
	service_contact VARCHAR NOT NULL, 
	notes TEXT NOT NULL, 
	PRIMARY KEY (id)
);
