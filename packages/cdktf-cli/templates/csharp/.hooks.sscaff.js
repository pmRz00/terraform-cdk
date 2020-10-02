const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

const cli = require.resolve('../../bin/cdktf');

exports.pre = (variables) => {
  try {
    if (os.platform() === 'win32') {
      execSync('where dotnet')
    }
    else {
      execSync('which dotnet')
    }
  } catch {
    console.error(`Unable to find "dotnet" installation. Install from https://dotnet.microsoft.com/download`);
    process.exit(1);
  }
};

exports.post = options => {
  const { nuget_cdktf, cdktf_version } = options;
  if (!nuget_cdktf) {
    throw new Error(`missing context "nuget_cdktf"`);
  }

  // Terraform Cloud configuration settings if the organization name and workspace is set.
  if (options.OrganizationName != '') {
    console.log(`\nGenerating Terraform Cloud configuration for '${options.OrganizationName}' organization and '${options.WorkspaceName}' workspace.....`)
    terraformCloudConfig(options.$base, options.OrganizationName, options.WorkspaceName)
  }

  // Todo: Do we want to support adding local nuget packages?

  execSync(`dotnet add package`, { stdio: 'inherit' });
  execSync(`dotnet add package ${nuget_cdktf}`, { stdio: 'inherit' });
  //execSync(`${cli} synth`, { stdio: 'inherit' });

  console.log(readFileSync('./help', 'utf-8'));
};

function terraformCloudConfig(baseName, organizationName, workspaceName) {
  template = readFileSync('./Main.cs', 'utf-8');

  result = template.replace(`import com.hashicorp.cdktf.App;`, `import com.hashicorp.cdktf.App;
import com.hashicorp.cdktf.NamedRemoteWorkspace;
import com.hashicorp.cdktf.RemoteBackend;
import com.hashicorp.cdktf.RemoteBackendProps;`);
  result = result.replace(`new Main(app, "${baseName}");`, `Main stack = new Main(app, "${baseName}");
new RemoteBackend(stack, RemoteBackendProps.builder().hostname("app.terraform.io").organization("${organizationName}").workspaces(new NamedRemoteWorkspace("${workspaceName}")).build());`);

  writeFileSync('./Main.css', result, 'utf-8');
}