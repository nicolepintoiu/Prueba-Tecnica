//función helper para hacer requests al backend
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> { //path es la URL e init es lo mismo que fetch recibe body,headers, etc

    const headers = new Headers(init.headers); //Crea un objeto Headers usando los headers que ya existan en init
                                              // los Headers sirven para decirle al navegador cómo tratar los datos
    
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) { 
      headers.set("Content-Type", "application/json"); //lo que va en el body está en formato JSON
    }

    // Llama al backend con fetch, usa path como URL y mezcla init con los headers
    const res = await fetch(path, { ...init, headers }); //request 
  
    //manejo de errores
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} ${text}`);
    }
  
    //
    const ct = res.headers.get("content-type") || ""; //lee el header HTTP de la respuesta y se uso "" para evitar null
    if (ct.includes("application/json")) return (await res.json()) as T;
    return (await res.text()) as unknown as T;
  }