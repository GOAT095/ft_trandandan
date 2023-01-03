export const simpleVertexShader = "#version 300 es\n" +
"layout (location = 0) in vec3 position;\n" +
"uniform mat4   view;\n" +
"uniform mat4   model;\n" +
"uniform mat4   projection;\n" +
"void main() {\n" +
"   gl_Position = projection * view * model * vec4(position, 1.0f);\n" +
"}";

export const simpleFragmentShader = "#version 300 es\n" +
"precision highp float;\n" +
"out vec4 color;\n" +
"uniform vec4   objColor;\n" +
"void main(){\n" +
"   color = objColor;\n" +
"}";

export const lightVertexShader = "#version 300 es\n" +
"layout (location = 0) in vec3 position;\n" +
"layout (location = 1) in vec3 normal;\n" +
"uniform mat4   view;\n" +
"uniform mat4   model;\n" +
"uniform mat4   projection;\n" +
"out vec3 oNormal;\n" + 
"out vec3 FragPos;\n" + 
"void main() {\n" +
"   oNormal = mat3(transpose(inverse(model))) * normal;\n" + 
"   FragPos = vec3(model * vec4(position, 1.0));\n" +
"   gl_Position = projection * view * model * vec4(position, 1.0f);\n" +
"}";

export const lightFragmentShader = "#version 300 es\n" +
"precision highp float;\n" +
"uniform float  ambientStrength;\n" +
"uniform vec4   lightColor;\n" +
"uniform vec3   lightPosition;\n" + 
"in vec3    FragPos;\n" +
"in vec3    oNormal;\n" +
"out vec4 color;\n" +
"uniform vec4   objColor;\n" +
"void main(){\n" +
"   vec3    norm = normalize(oNormal);\n" +
"   vec3    lightDir = normalize(lightPosition - FragPos);\n" + 
"   vec4    ambient = ambientStrength * lightColor;\n" +
"   float   diff = max(dot(norm, lightDir), 0.0);\n" +
"   vec4    diffuse = diff * lightColor;\n" +
"   vec4    result = (ambient + diffuse) * objColor;\n" +
"   color = vec4(result[0], result[1], result[2], 1.0);\n" +
"}";