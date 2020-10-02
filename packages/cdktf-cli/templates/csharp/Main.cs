using System;

using Hashicorp.Cdktf.App;
using Hashicorp.Cdktf.TerraformStack;

namespace MyCompany.MyApp
{
    class Main : TerraformStack
    {        
        public Main(Construct scope, String id) : base(scope, id)
        {
            // define resources here
        }

        public static void main(String[] args)
        {
            const App app = new App();
            new Main(app, "{{ $base }}");
            app.synth();
        }
    }
}