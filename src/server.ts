import express, { Request, Response } from "express";

import mustacheExpress from "mustache-express";

const app = express();

const port = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const router = express.Router();
app.use(router);

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");
app.use("/", express.static(__dirname + "/public"));

router.get("/", (req: Request, res: Response) => {
  const blocos = [
    { name: "A" },
    { name: "B" },
    { name: "C" },
    { name: "D" },
    { name: "E" },
    { name: "F" },
    { name: "G" },
    { name: "H" },
    { name: "I" },
    { name: "J" },
    { name: "K" },
  ];
  const sizeBlock = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
    { value: 6 },
    { value: 7 },
    { value: 8 },
    { value: 9 },
    { value: 10 },
    { value: 11 },
  ];

  const disk: Array<{ index: number; value: string | number }> = [
    { index: 0, value: "-" },
    { index: 1, value: "-" },
    { index: 2, value: "-" },
    { index: 3, value: "-" },
    { index: 4, value: "-" },
    { index: 5, value: "-" },
    { index: 6, value: "-" },
    { index: 7, value: "-" },
    { index: 8, value: "-" },
    { index: 9, value: "-" },
    { index: 10, value: "-" },
    { index: 11, value: "-" },
    { index: 12, value: "-" },
    { index: 13, value: "-" },
    { index: 14, value: "-" },
    { index: 15, value: "-" },
    { index: 16, value: "-" },
    { index: 17, value: "-" },
    { index: 18, value: "-" },
    { index: 19, value: "-" },
  ];

  res.render("index", {
    blocos,
    sizeBlock,
    disk,
  });
});

router.post("/gravar", (req: Request, res: Response) => {
  type DiskFormated = [{ index: number; value: number | string }];

  const sizeBlock = [
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
    { value: 5 },
    { value: 6 },
    { value: 7 },
    { value: 8 },
    { value: 9 },
    { value: 10 },
    { value: 11 },
  ];

  const diskString: Array<string> = req.body.disk.split("|");
  let disk = [];

  for (const item of diskString) {
    if (item.split(",")[1]?.replace(" ", "") !== undefined) {
      disk.push({
        index: parseInt(item.split(",")[0]?.replace(" ", "")),
        value: item.split(",")[1]?.replace(" ", ""),
      });
    }
  }
  disk as DiskFormated;
  const size = req.body.size;
  const TipoDeBloco = req.body.TipoDeBloco;
  const diretorio = req.body.diretorio ? req.body.diretorio : [];
  const blocos: string[] = req.body.blocos.split(" ");

  console.log(req.body.blocos);
  console.log(req.body.disk);
  console.log("Blocos", blocos);
  console.log("disk", disk);

  const NumeroDePosicoesDisponiveis = (disk: DiskFormated) => {
    console.log("Pegando Posições disponiveis");
    let countPosition = 0;

    for (let position = 0; position < 20; position++) {
      if (disk[position].value === "-") countPosition++;
    }

    console.log("Posições Disponineis", countPosition);
    return countPosition;
  };

  const PegarBlocoDoIndice = (disk: DiskFormated) => {
    let inicial = true;

    for (let position = 0; position < 20; position++) {
      if (inicial) {
        if (disk[position]?.value === "-") {
          console.log("Encontrou uma posição Livre: ", position);
          inicial = false;
          return position;
        }
      }
    }
  };

  const pegarTodasAsPosicoesDisponiveis = (
    disk: DiskFormated,
    posicaoDoIndex: number,
    size: number
  ) => {
    let arrayDePosicoes: number[] = [];

    let countSize = 0;
    for (let position = posicaoDoIndex + 1; position <= 19; position++) {
      if (disk[position]?.value === "-" && countSize < size) {
        arrayDePosicoes.push(position);
        countSize++;
      }
    }
    return arrayDePosicoes;
  };
  const distribuirBlocosNoDisco = (
    disk: DiskFormated,
    arrayDePosicoes: number[],
    bloco: string
  ) => {
    if (disk !== undefined && disk.length > 0) {
      arrayDePosicoes.forEach((item: number) => {
        disk[item as number].value = bloco;
      });
    }

    return disk;
  };

  const GravarOsIndicesDeBloco = (
    disk: DiskFormated,
    posicaoDoBlocoDeIndice: number,
    posicoes: Number[]
  ) => {
    const posicoesString = posicoes.join(",");
    disk[posicaoDoBlocoDeIndice].value = posicoesString;
    return disk;
  };

  // VERIFICA SE HÁ ESPAÇO 

  if (NumeroDePosicoesDisponiveis(disk as DiskFormated) > size - 1) {
    //GUARDA A POSIÇÃO DOS INDEXES
    const posicaoDoBlocoDeIndice = PegarBlocoDoIndice(
      disk as DiskFormated 
    ) as number;

    diretorio.push({
      TipoDeBloco: TipoDeBloco,
      BlocoDoIndice: posicaoDoBlocoDeIndice as number,
    }); 

    //PEGA TODAS AS POSIÇÕES A PARTIR DO BLOCO DE INDICE
    const posicoesDosIndices = pegarTodasAsPosicoesDisponiveis(
      disk as DiskFormated,
      posicaoDoBlocoDeIndice,
      size
    );

    const diskGravado = GravarOsIndicesDeBloco(
      disk as DiskFormated,
      posicaoDoBlocoDeIndice,
      posicoesDosIndices
    );

    const diskOk = distribuirBlocosNoDisco(
      diskGravado,
      posicoesDosIndices,
      TipoDeBloco
    );
    let bloscosLivres: object[] = [];
    blocos.forEach((item: string) => {
      if (item !== TipoDeBloco && item !== "")
        bloscosLivres.push({ name: item });
    });

    res.render("index", {
      blocos: bloscosLivres,
      disk: diskOk,
      sizeBlock,
      sucessMessage: true
     // diretorio: JSON.stringify(diretorio),
    });
  } else {

    let bloscosLivres: object[] = []; 

    blocos.forEach((item: string) => {
      if (item !== "") bloscosLivres.push({ name: item });
    });
    res.render("index", {
      messageError: true,
      blocos: bloscosLivres,
      disk,
      sizeBlock,
      diretorio,
    }); 
  }
});

app.listen(port, () => {
  console.log("api rodando na porta", port);
});
