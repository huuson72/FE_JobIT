# CV Builder Application

This CV builder application allows users to create and edit professional CVs using a variety of templates.

## Features

- Multiple CV templates: Modern, Technical, Minimal, and Creative
- Edit mode for in-place editing of all fields
- Drag and drop functionality for adding custom fields
- Easy customization of field labels and values
- Export to PDF (coming soon)

## How to Use the Drag and Drop Feature

The application now supports drag and drop functionality to add custom fields to your CV. Here's how to use it:

1. **Enable Edit Mode**: Click the edit toggle in the top-right corner to enable editing.

2. **Open the Fields Panel**: When edit mode is active, a panel of draggable fields will appear on the right side of the screen.

3. **Drag Fields to Your CV**: 
   - Drag any field from the panel and drop it into one of the designated drop zones in your CV.
   - Drop zones are indicated by dashed borders that appear when you're in edit mode.
   - Drop zones become highlighted when you drag a field over them.

4. **Add Field Value**: 
   - When you drop a field, a modal will appear asking for the field value.
   - The field name will be pre-filled based on what you dragged.
   - Enter the value for your field and click "Add".

5. **Edit Custom Fields**:
   - Once added, custom fields can be edited directly on the CV like any other field.
   - You can edit both the field name and its value.

6. **Add Custom Field Types**:
   - If you don't see the field type you need in the panel, click "Tùy chỉnh trường mới" to add a completely custom field.

## Field Types

The application comes with several suggested field types:

- Languages
- Certifications
- Projects
- References
- Interests
- Publications
- Patents
- Volunteering

## Templates

Each template displays custom fields in different sections:

- **Modern Template**: Custom fields appear in the "THÔNG TIN THÊM" section in the sidebar
- **Technical Template**: Custom fields appear in the "ADDITIONAL INFO" section in the sidebar
- **Minimal Template**: Custom fields appear in the "THÔNG TIN BỔ SUNG" section between objective and experience
- **Creative Template**: Custom fields appear in designated areas based on where you drop them

## Development

This application is built with:

- React
- TypeScript
- Ant Design
- Vite

### Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
``` 